<script setup>
import { ref } from 'vue'

const isConnected = ref(false)
const walletAddress = ref('')

const connectJunoWallet = async () => {
  try {
    // Check if Keplr is installed
    if (!window.keplr) {
      alert('Please install Keplr wallet to connect to Juno network')
      return
    }

    // Enable Keplr for Juno chain
    await window.keplr.enable('juno-1')
    const offlineSigner = window.keplr.getOfflineSigner('juno-1')
    
    // Get the wallet address
    const accounts = await offlineSigner.getAccounts()
    if (accounts && accounts.length > 0) {
      walletAddress.value = accounts[0].address
      isConnected.value = true
    }
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    alert('Failed to connect to Juno wallet. Please try again.')
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
        <h1>Connect Your Juno Wallet</h1>
        <div v-if="!isConnected" class="connect-section">
          <button @click="connectJunoWallet" class="connect-button">Connect Juno Wallet</button>
          <p class="wallet-description">Connect your Keplr wallet to interact with the Juno network</p>
        </div>
        <div v-else class="wallet-info">
          <p class="address">Connected Address: {{ walletAddress }}</p>
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
  font-size: 2rem;
}

.wallet-description {
  color: rgba(255, 255, 255, 0.7);
  margin-top: 1rem;
  font-size: 0.9rem;
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
  width: 200px;
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

.address {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.9rem;
  word-break: break-all;
  margin: 1rem 0;
}
</style>