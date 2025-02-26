package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/supabase-community/postgrest-go"

	"btmcoin/redis"
)

type Click struct {
	CountryCode string `json:"country_code"`
	Flag        string `json:"flag"`
}

type ClickProcessor struct {
	clickBuffer     []Click
	bufferMutex     sync.Mutex
	clickCountMutex sync.Mutex
	clickCount      int64
	batchSize       int
	processInterval time.Duration
	supabaseClient  *postgrest.Client
	redisClient     *redis.RedisClient
	batchChannel    chan []Click
	errorChannel    chan error
	workerCount     int
	hub             *WebSocketHub
}

func (cp *ClickProcessor) updateSupabase(countryCode, flag string, count int) error {
	// Update with new click count using upsert
	_, count_affected, err := cp.supabaseClient.From("country_clicks").Upsert(map[string]interface{}{
		"country_code": countryCode,
		"flag":        flag,
		"clicks":      count,
	}, "country_code", "flag", "clicks").Execute()

	if err != nil {
		return err
	}
	if count_affected == 0 {
		return fmt.Errorf("no rows were affected")
	}
	return nil
}

func NewClickProcessor(batchSize int, processInterval time.Duration, workerCount int, supabaseURL, supabaseKey string) *ClickProcessor {
	client := postgrest.NewClient(supabaseURL, supabaseKey, map[string]string{
		"apikey":        supabaseKey,
		"Authorization": "Bearer " + supabaseKey,
	})

	redisClient, err := redis.NewRedisClient("localhost:6379", "", 0)
	if err != nil {
		log.Printf("Warning: Failed to connect to Redis: %v", err)
	}

	return &ClickProcessor{
		clickBuffer:     make([]Click, 0, batchSize),
		batchSize:       batchSize,
		processInterval: processInterval,
		supabaseClient:  client,
		redisClient:     redisClient,
		batchChannel:    make(chan []Click, 1000),
		errorChannel:   make(chan error, 1000),
		workerCount:     workerCount,
		clickCount:      0,
	}
}

func (cp *ClickProcessor) AddClick(click Click) {
	cp.clickCountMutex.Lock()
	cp.clickCount++
	cp.clickCountMutex.Unlock()

	// Try to increment in Redis first
	if cp.redisClient != nil {
		if err := cp.redisClient.IncrementClick(click.CountryCode, click.Flag); err != nil {
			log.Printf("Failed to increment click in Redis: %v", err)
			// Fallback to buffer if Redis fails
			cp.bufferMutex.Lock()
			cp.clickBuffer = append(cp.clickBuffer, click)
			cp.bufferMutex.Unlock()
		}
		return
	}

	// Fallback to original buffer logic if Redis is not available
	cp.bufferMutex.Lock()
	cp.clickBuffer = append(cp.clickBuffer, click)

	if len(cp.clickBuffer) >= cp.batchSize {
		batch := cp.clickBuffer
		cp.clickBuffer = make([]Click, 0, cp.batchSize)
		cp.bufferMutex.Unlock()
		cp.batchChannel <- batch
		return
	}
	cp.bufferMutex.Unlock()
}

func (cp *ClickProcessor) processBatch(clicks []Click) error {
	clickMap := make(map[string]struct {
		Count int
		Flag  string
	})

	// Aggregate clicks by country
	for _, click := range clicks {
		if entry, exists := clickMap[click.CountryCode]; exists {
			entry.Count++
			clickMap[click.CountryCode] = entry
		} else {
			clickMap[click.CountryCode] = struct {
				Count int
				Flag  string
			}{1, click.Flag}
		}
	}

	// Update Supabase with retries
	for countryCode, data := range clickMap {
		var retries int = 0
		var err error
		for retries < 5 {
			err = cp.updateSupabase(countryCode, data.Flag, data.Count)
			if err == nil {
				break
			}
			retries++
			time.Sleep(time.Duration(1<<uint(retries)) * time.Second)
		}
		if err != nil {
			log.Printf("Failed to update clicks for %s after %d retries: %v", countryCode, retries, err)
		}
	}

	return nil
}

func (cp *ClickProcessor) GetClickCount() int64 {
	cp.clickCountMutex.Lock()
	defer cp.clickCountMutex.Unlock()
	return cp.clickCount
}

func (cp *ClickProcessor) StartProcessing() {
	// Start worker pool
	for i := 0; i < cp.workerCount; i++ {
		go func() {
			for batch := range cp.batchChannel {
				if err := cp.processBatch(batch); err != nil {
					cp.errorChannel <- err
				}
			}
		}()
	}

	// Start Redis flush interval
	if cp.redisClient != nil {
		go func() {
			ticker := time.NewTicker(cp.processInterval)
			defer ticker.Stop()

			for range ticker.C {
				clickData, err := cp.redisClient.FlushToDatabase()
				if err != nil {
					log.Printf("Error flushing Redis data: %v", err)
					continue
				}

				for countryCode, data := range clickData {
					if err := cp.updateSupabase(countryCode, data.Flag, data.Count); err != nil {
						log.Printf("Error updating Supabase from Redis data: %v", err)
					}
				}
			}
		}()
	}

	// Start interval processor
	go func() {
		ticker := time.NewTicker(cp.processInterval)
		defer ticker.Stop()

		for range ticker.C {
			cp.bufferMutex.Lock()
			if len(cp.clickBuffer) == 0 {
				cp.bufferMutex.Unlock()
				continue
			}

			batch := cp.clickBuffer
			cp.clickBuffer = make([]Click, 0, cp.batchSize)
			cp.bufferMutex.Unlock()

			cp.batchChannel <- batch
		}
	}()

	// Start error handler
	go func() {
		for err := range cp.errorChannel {
			log.Printf("Error processing batch: %v", err)
		}
	}()
}

type WebSocketHub struct {
	clients    map[*WebSocketClient]bool
	broadcast  chan interface{}
	register   chan *WebSocketClient
	unregister chan *WebSocketClient
}

type WebSocketClient struct {
	hub  *WebSocketHub
	conn *websocket.Conn
	send chan []byte
}

func newHub() *WebSocketHub {
	return &WebSocketHub{
		broadcast:  make(chan interface{}, 256),
		register:   make(chan *WebSocketClient),
		unregister: make(chan *WebSocketClient),
		clients:    make(map[*WebSocketClient]bool),
	}
}

func (h *WebSocketHub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- []byte(fmt.Sprintf("%v", message)):
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

func main() {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_ANON_KEY")

	if supabaseURL == "" || supabaseKey == "" {
		log.Fatal("SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required")
	}

	hub := newHub()
	go hub.run()

	processor := NewClickProcessor(
		1000,                  // Process in larger batches of 1000
		500*time.Millisecond, // Process every 500ms
		10,                   // Use 10 concurrent workers
		supabaseURL,
		supabaseKey,
	)
	processor.hub = hub

	processor.StartProcessing()

	r := mux.NewRouter()

	// Initialize rate limiter - 10 requests per second per IP
	rateLimiter := middleware.NewRateLimiter(1*time.Second, 10)

	r.HandleFunc("/stats", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]int64{
			"total_clicks": processor.GetClickCount(),
		})
	}).Methods("GET")

	// Apply rate limiter middleware to the click endpoint
	clickHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var click Click
		if err := json.NewDecoder(r.Body).Decode(&click); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		processor.AddClick(click)
		w.WriteHeader(http.StatusOK)
	})
	r.Handle("/click", rateLimiter.Middleware(clickHandler)).Methods("POST")

	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow all origins in development
		},
	}

	r.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err)
			return
		}
		client := &WebSocketClient{hub: hub, conn: conn, send: make(chan []byte, 256)}
		client.hub.register <- client

		go func() {
			defer func() {
				client.hub.unregister <- client
				client.conn.Close()
			}()
			for {
				_, _, err := client.conn.ReadMessage()
				if err != nil {
					break
				}
			}
		}()

		go func() {
			defer client.conn.Close()
			for message := range client.send {
				w, err := client.conn.NextWriter(websocket.TextMessage)
				if err != nil {
					return
				}
				w.Write(message)
				if err := w.Close(); err != nil {
					return
				}
			}
		}()
	})

	log.Printf("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}