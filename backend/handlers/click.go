package handlers

import (
    "context"
    "encoding/json"
    "fmt"
    "net/http"
    "time"

    "github.com/go-redis/redis/v8"
    "gorm.io/gorm"
)

type ClickRequest struct {
    CountryCode string `json:"country_code"`
    Flag        string `json:"flag"`
}

type CountryClick struct {
    CountryCode string `gorm:"primaryKey"`
    Flag        string
    Clicks      int64
    UpdatedAt   time.Time
}

func HandleClick(db *gorm.DB, rdb *redis.Client) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var req ClickRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
        }

        // Rate limiting
        ip := r.RemoteAddr
        key := fmt.Sprintf("rate_limit:%s", ip)
        ctx := context.Background()

        count, err := rdb.Incr(ctx, key).Result()
        if err != nil {
            http.Error(w, "Rate limit error", http.StatusInternalServerError)
            return
        }

        // First request, set expiry
        if count == 1 {
            rdb.Expire(ctx, key, time.Second)
        }

        if count > 10 { // 10 clicks per second
            http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
            return
        }

        // Update click count in database
        var click CountryClick
        result := db.FirstOrCreate(&click, CountryClick{CountryCode: req.CountryCode})
        if result.Error != nil {
            http.Error(w, result.Error.Error(), http.StatusInternalServerError)
            return
        }

        click.Flag = req.Flag
        click.Clicks++
        click.UpdatedAt = time.Now()

        if err := db.Save(&click).Error; err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(map[string]interface{}{
            "success": true,
            "clicks": click.Clicks,
        })
    }
}

func GetLeaderboard(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var clicks []CountryClick
        if err := db.Order("clicks desc").Limit(10).Find(&clicks).Error; err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(clicks)
    }
}

func GetTotalClicks(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var total int64
        if err := db.Model(&CountryClick{}).Select("COALESCE(SUM(clicks), 0)").Scan(&total).Error; err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]int64{"total": total})
    }
}