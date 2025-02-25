<script setup>
import { ref } from 'vue'

const isConnected = ref(false)
const walletAddress = ref('')

const connectCosmosWallet = async () => {
  try {
    // Here we'll implement the actual Cosmos wallet connection
    // This is a placeholder for the actual implementation
    console.log('Connecting to Cosmos wallet...')
    isConnected.value = true
    walletAddress.value = 'cosmos1....' // This will be the actual address
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
      <h1>Connect Your Wallet</h1>
      <div class="wallet-content">
        <div v-if="!isConnected" class="connect-section">
          <p>Connect your Cosmos wallet to interact with BTM</p>
          <button class="connect-button" @click="connectCosmosWallet">
            Connect Wallet
          </button>
        </div>
        <div v-else class="wallet-info">
          <h2>Wallet Connected</h2>
          <p class="address">{{ walletAddress }}</p>
          <button class="disconnect-button" @click="disconnectWallet">
            Disconnect
          </button>
        </div>
      </div>
    </div>
  </div>
</template>