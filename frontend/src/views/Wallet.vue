<script setup>
import { ref } from 'vue'

const isConnected = ref(false)
const walletAddress = ref('')

const connectCosmosWallet = async () => {
  try {
    console.log('Connecting to Cosmos wallet...')
    isConnected.value = true
    walletAddress.value = 'cosmos1....' 
  } catch (error) {
    console.error('Failed to connect wallet:', error)
  }
}

const disconnectWallet = () => {
  isConnected.value = false
  walletAddress.value = ''
}
</script>

<template>
  <div class="wallet-page">
    <div class="wallet-container">
      <div class="wallet-content">
        <h1>Connect Your Wallet</h1>
        <div v-if="!isConnected" class="connect-section">
          <button @click="connectCosmosWallet" class="connect-button">Connect Cosmos Wallet</button>
        </div>
        <div v-else class="wallet-info">
          <p>Connected Address: {{ walletAddress }}</p>
          <button @click="disconnectWallet" class="disconnect-button">Disconnect</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wallet-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.wallet-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.wallet-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 500px;
}

.wallet-content h1 {
  margin-bottom: 2rem;
  color: white;
}

.connect-button, .disconnect-button {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border: none;
  padding: 1rem 2rem;
  border-radius: 20px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.connect-button:hover, .disconnect-button:hover {
  transform: scale(1.05);
  background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
}

.disconnect-button {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  margin-top: 1rem;
}

.wallet-info {
  color: white;
}

.wallet-info p {
  margin-bottom: 1rem;
  word-break: break-all;
}
</style>