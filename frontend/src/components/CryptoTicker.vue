<template>
  <div class="crypto-ticker-container">
    <div class="crypto-ticker" :style="{ '--total-items': cryptoPrices.length }">
      <div class="ticker-content">
        <div v-for="(crypto, index) in [...cryptoPrices, ...cryptoPrices]" :key="`${crypto.symbol}-${index}`" class="ticker-item">
          <span class="crypto-symbol">{{ crypto.symbol }}</span>
          <span class="crypto-price" :class="{ 'price-up': crypto.priceChange > 0, 'price-down': crypto.priceChange < 0 }">
            ${{ formatPrice(crypto.price) }}
          </span>
          <span class="price-change" :class="{ 'price-up': crypto.priceChange > 0, 'price-down': crypto.priceChange < 0 }">
            {{ crypto.priceChange > 0 ? '+' : '' }}{{ crypto.priceChange.toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crypto-ticker-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(30, 27, 75, 0.8);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  height: 32px;
  overflow: hidden;
  z-index: 1000;
}

.crypto-ticker {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.ticker-content {
  display: flex;
  animation: ticker calc(var(--total-items) * 8s) linear infinite;
  white-space: nowrap;
}

.ticker-item {
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.crypto-symbol {
  font-weight: 600;
  margin-right: 6px;
}

.crypto-price {
  margin-right: 6px;
}

.price-change {
  font-size: 11px;
}

.price-up {
  color: #10B981;
}

.price-down {
  color: #EF4444;
}

@keyframes ticker {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>

<script>
export default {
  name: 'CryptoTicker',
  data() {
    return {
      cryptoPrices: [],
      websocket: null
    }
  },
  methods: {
    formatPrice(price) {
      return price > 1 ? price.toFixed(2) : price.toFixed(6)
    },
    async fetchCryptoPrices() {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","BNBUSDT","XRPUSDT","ADAUSDT","DOGEUSDT","DOTUSDT","UNIUSDT"]')
        const data = await response.json()
        this.cryptoPrices = data.map(item => ({
          symbol: item.symbol.replace('USDT', ''),
          price: parseFloat(item.lastPrice),
          priceChange: parseFloat(item.priceChangePercent)
        }))
      } catch (error) {
        console.error('Error fetching crypto prices:', error)
      }
    },
    initWebSocket() {
      this.websocket = new WebSocket('wss://stream.binance.com:9443/ws')
      
      const symbols = ['btcusdt', 'ethusdt', 'bnbusdt', 'xrpusdt', 'adausdt', 'dogeusdt', 'dotusdt', 'uniusdt']
      const subscribeMsg = {
        method: 'SUBSCRIBE',
        params: symbols.map(symbol => `${symbol}@ticker`),
        id: 1
      }

      this.websocket.onopen = () => {
        this.websocket.send(JSON.stringify(subscribeMsg))
      }

      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.s && data.s.endsWith('USDT')) {
          const symbol = data.s.replace('USDT', '')
          const index = this.cryptoPrices.findIndex(crypto => crypto.symbol === symbol)
          if (index !== -1) {
            this.cryptoPrices[index] = {
              symbol,
              price: parseFloat(data.c),
              priceChange: parseFloat(data.P)
            }
          }
        }
      }

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    }
  },
  async mounted() {
    await this.fetchCryptoPrices()
    this.initWebSocket()
  },
  beforeUnmount() {
    if (this.websocket) {
      this.websocket.close()
    }
  }
}
</script>

<style scoped>
.crypto-ticker-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
}

.crypto-ticker {
  overflow: hidden;
  white-space: nowrap;
  height: 40px;
  position: relative;
}

.ticker-content {
  display: inline-block;
  animation: ticker 60s linear infinite;
  padding-left: 100%;
}

.ticker-item {
  display: inline-flex;
  align-items: center;
  margin-right: 30px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.crypto-symbol {
  font-weight: bold;
  margin-right: 8px;
}

.crypto-price {
  margin-right: 8px;
}

.price-change {
  font-size: 12px;
  font-weight: 500;
}

.price-up {
  color: #4CAF50;
}

.price-down {
  color: #f44336;
}

@keyframes ticker {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

/* Pause animation on hover */
.crypto-ticker:hover .ticker-content {
  animation-play-state: paused;
}
</style>