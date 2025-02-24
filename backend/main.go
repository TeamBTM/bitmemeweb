package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/supabase-community/postgrest-go"
)

type Click struct {
	CountryCode string `json:"country_code"`
	Flag        string `json:"flag"`
}

type ClickProcessor struct {
	clickBuffer     []Click
	bufferMutex     sync.Mutex
	batchSize       int
	processInterval time.Duration
	supabaseClient  *postgrest.Client
	batchChannel    chan []Click
	errorChannel   chan error
}

func NewClickProcessor(batchSize int, processInterval time.Duration, supabaseURL, supabaseKey string) *ClickProcessor {
	client := postgrest.NewClient(supabaseURL, map[string]string{
		"apikey":        supabaseKey,
		"Authorization": "Bearer " + supabaseKey,
	})

	return &ClickProcessor{
		clickBuffer:     make([]Click, 0, batchSize),
		batchSize:       batchSize,
		processInterval: processInterval,
		supabaseClient:  client,
		batchChannel:    make(chan []Click, 10),
		errorChannel:   make(chan error, 10),
	}
}

func (cp *ClickProcessor) AddClick(click Click) {
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

func (cp *ClickProcessor) updateSupabase(countryCode, flag string, count int) error {
	// Update with new click count using upsert directly
	_, err := cp.supabaseClient.From("country_clicks").Upsert(map[string]interface{}{
		"country_code": countryCode,
		"flag":         flag,
		"clicks":       count,
	}, map[string]interface{}{
		"clicks": "clicks + " + string(count),
	}).Execute()

	return err
}

func (cp *ClickProcessor) StartProcessing() {
	// Start batch processor
	go func() {
		for batch := range cp.batchChannel {
			if err := cp.processBatch(batch); err != nil {
				cp.errorChannel <- err
			}
		}
	}()

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

func main() {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_ANON_KEY")

	if supabaseURL == "" || supabaseKey == "" {
		log.Fatal("SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required")
	}

	processor := NewClickProcessor(
		100,                    // Process in smaller batches of 100
		2*time.Second,         // Process every 2 seconds
		supabaseURL,
		supabaseKey,
	)

	processor.StartProcessing()

	r := mux.NewRouter()
	r.HandleFunc("/click", func(w http.ResponseWriter, r *http.Request) {
		var click Click
		if err := json.NewDecoder(r.Body).Decode(&click); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		processor.AddClick(click)
		w.WriteHeader(http.StatusOK)
	}).Methods("POST")

	log.Printf("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}