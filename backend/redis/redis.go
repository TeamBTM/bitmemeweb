package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/go-redis/redis/v8"
)

type ClickData struct {
	Count int    `json:"count"`
	Flag  string `json:"flag"`
}

type RedisClient struct {
	client *redis.Client
	ctx    context.Context
}

func NewRedisClient(addr string, password string, db int) (*RedisClient, error) {
	// Get Redis configuration from environment variables
	poolSize, _ := strconv.Atoi(os.Getenv("REDIS_POOL_SIZE"))
	minIdleConns, _ := strconv.Atoi(os.Getenv("REDIS_MIN_IDLE_CONNS"))
	maxRetries, _ := strconv.Atoi(os.Getenv("REDIS_MAX_RETRIES"))
	retryInterval, _ := strconv.Atoi(os.Getenv("REDIS_RETRY_INTERVAL"))

	// Set default values if environment variables are not set
	if poolSize == 0 {
		poolSize = 10
	}
	if minIdleConns == 0 {
		minIdleConns = 5
	}
	if maxRetries == 0 {
		maxRetries = 3
	}
	if retryInterval == 0 {
		retryInterval = 1000
	}

	client := redis.NewClient(&redis.Options{
		Addr:            addr,
		Password:        password,
		DB:              db,
		PoolSize:        poolSize,
		MinIdleConns:    minIdleConns,
		MaxRetries:      maxRetries,
		MaxRetryBackoff: time.Duration(retryInterval) * time.Millisecond,
	})

	ctx := context.Background()

	// Test the connection with retries
	for i := 0; i < maxRetries; i++ {
		_, err := client.Ping(ctx).Result()
		if err == nil {
			break
		}
		if i == maxRetries-1 {
			return nil, fmt.Errorf("failed to connect to Redis after %d retries: %v", maxRetries, err)
		}
		time.Sleep(time.Duration(retryInterval) * time.Millisecond)
	}

	return &RedisClient{
		client: client,
		ctx:    ctx,
	}, nil
}

// IncrementClick increments the click count for a country in Redis
func (rc *RedisClient) IncrementClick(countryCode string, flag string) error {
	key := fmt.Sprintf("clicks:%s", countryCode)

	// Get existing data
	var data ClickData
	val, err := rc.client.Get(rc.ctx, key).Result()
	if err == redis.Nil {
		// Key doesn't exist, create new data
		data = ClickData{Count: 1, Flag: flag}
	} else if err != nil {
		return err
	} else {
		// Unmarshal existing data
		if err := json.Unmarshal([]byte(val), &data); err != nil {
			return err
		}
		data.Count++
	}

	// Marshal and save data
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	// Set with expiration (e.g., 1 hour)
	return rc.client.Set(rc.ctx, key, jsonData, time.Hour).Err()
}

// GetClickData gets the click data for a country from Redis
func (rc *RedisClient) GetClickData(countryCode string) (*ClickData, error) {
	key := fmt.Sprintf("clicks:%s", countryCode)
	val, err := rc.client.Get(rc.ctx, key).Result()
	if err == redis.Nil {
		return nil, nil
	} else if err != nil {
		return nil, err
	}

	var data ClickData
	if err := json.Unmarshal([]byte(val), &data); err != nil {
		return nil, err
	}

	return &data, nil
}

// FlushToDatabase prepares data for database update
func (rc *RedisClient) FlushToDatabase() (map[string]ClickData, error) {
	pattern := "clicks:*"
	iter := rc.client.Scan(rc.ctx, 0, pattern, 0).Iterator()

	clickData := make(map[string]ClickData)
	for iter.Next(rc.ctx) {
		key := iter.Val()
		countryCode := key[7:] // Remove "clicks:" prefix

		data, err := rc.GetClickData(countryCode)
		if err != nil {
			return nil, err
		}
		if data != nil {
			clickData[countryCode] = *data
			// Delete the key after reading
			rc.client.Del(rc.ctx, key)
		}
	}

	return clickData, iter.Err()
}