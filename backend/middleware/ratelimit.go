package middleware

import (
	"net/http"
	"sync"
	"time"
)

type RateLimiter struct {
	ips    map[string][]time.Time
	mu     sync.RWMutex
	window time.Duration
	limit  int
}

func NewRateLimiter(window time.Duration, limit int) *RateLimiter {
	return &RateLimiter{
		ips:    make(map[string][]time.Time),
		window: window,
		limit:  limit,
	}
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr

		rl.mu.Lock()
		now := time.Now()
		
		// Clean old records
		if timestamps, exists := rl.ips[ip]; exists {
			valid := timestamps[:0]
			for _, t := range timestamps {
				if now.Sub(t) <= rl.window {
					valid = append(valid, t)
				}
			}
			rl.ips[ip] = valid
		}

		// Check rate limit
		if len(rl.ips[ip]) >= rl.limit {
			rl.mu.Unlock()
			http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
			return
		}

		// Add new timestamp
		rl.ips[ip] = append(rl.ips[ip], now)
		rl.mu.Unlock()

		next.ServeHTTP(w, r)
	})
}