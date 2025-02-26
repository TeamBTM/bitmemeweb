<script setup>
import { ref } from 'vue'
import { JUNO_TESTNET } from '@/services/blockchain/config'
import { requestTestnetTokens as requestTokens } from '@/services/blockchain/faucet'
import { queryAllBalances } from '@/services/blockchain/balances'

const isTestnet = ref(true)
const isConnected = ref(false)
const walletAddress = ref('')
const networkBalances = ref([])
const selectedWallet = ref('keplr') // Add wallet selection state
const networkInfo = ref({
  chainId: '',
  chainName: '',
  rpc: '',
  rest: ''
})
const connectionError = ref('')
const isLoadingBalances = ref(false)

const connectWallet = async (walletType) => {
  connectionError.value = ''
  selectedWallet.value = walletType
  
  try {
    const wallet = window[walletType]
    if (!wallet) {
      connectionError.value = `Please install the ${walletType === 'keplr' ? 'Keplr' : 'Leap'} wallet to connect`
      return
    }

    try {
      await wallet.enable(JUNO_TESTNET.chainId)
    } catch (error) {
      console.error(`${walletType} enable error:`, error)
      connectionError.value = `Could not enable ${walletType === 'keplr' ? 'Keplr' : 'Leap'} wallet`
      return
    }

    const offlineSigner = wallet.getOfflineSigner(JUNO_TESTNET.chainId)
    
    try {
      if (!offlineSigner) {
        throw new Error('Failed to initialize offline signer')
      }

      const accounts = await offlineSigner.getAccounts()
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in the wallet')
      }

      walletAddress.value = accounts[0].address
      isConnected.value = true
      await fetchAllBalances()
    } catch (error) {
      console.error('Account fetch error:', error)
      connectionError.value = 'Error getting account information'
      return
    }
  } catch (error) {
    console.error('Wallet connection error:', error)
    connectionError.value = `Error connecting wallet: ${error.message || 'Unknown error'}`
  }
}

const fetchAllBalances = async () => {
  if (!isConnected.value || !walletAddress.value) return
  
  isLoadingBalances.value = true
  try {
    networkBalances.value = await queryAllBalances(window[selectedWallet.value], walletAddress.value)
  } catch (error) {
    console.error('Balance fetch error:', error)
    connectionError.value = `Failed to fetch balances: ${error.message || 'Unknown error'}`
  } finally {
    isLoadingBalances.value = false
  }
}

const disconnectWallet = () => {
  isConnected.value = false
  walletAddress.value = ''
  networkBalances.value = []
  connectionError.value = ''
  selectedWallet.value = 'keplr'
  networkInfo.value = {
    chainId: '',
    chainName: '',
    rpc: '',
    rest: ''
  }
}
</script>

<template>
  <div class="wallet-page">
    <div class="wallet-container">
      <div class="wallet-content">
        <h1>Cosmos Network Wallet</h1>
        <div v-if="!isConnected" class="connect-section">
          <button @click="() => connectWallet('keplr')" class="connect-button keplr-button">
            Connect Keplr Wallet
          </button>
          <button @click="() => connectWallet('leap')" class="connect-button leap-button">
            Connect Leap Wallet
          </button>
          <p class="wallet-description">Connect your wallet to view balances across Cosmos networks</p>
          <p v-if="connectionError" class="error-message">{{ connectionError }}</p>
        </div>

        <div v-else class="wallet-info">
          <div class="success-message">
            <p>Connected! 🎉</p>
            <p>But seriously… Nothing to do here! you're in a meme project. Your crypto PhD won't save you here. 😂</p>
            <p>Mission: Go Home. Click. Burn. Repeat. 🖱️🔥</p>
          </div>
          <div class="info-section">
            <h2>Wallet Information</h2>
            <p class="address">Connected Address: {{ walletAddress }}</p>
            <p class="wallet-type">Connected Wallet: {{ selectedWallet === 'keplr' ? 'Keplr' : 'Leap' }}</p>
            
            <div class="balances-section">
              <h3>Your Balances</h3>
              <div v-if="isLoadingBalances" class="loading-message">
                Loading balances...
              </div>
              <div v-else-if="networkBalances.length === 0" class="no-balances-message">
                No positive balances found in any network
              </div>
              <div v-else class="balance-list">
                <div v-for="balance in networkBalances" :key="balance.chainId" class="balance-item">
                  <span class="network-name">{{ balance.chainName }}</span>
                  <span class="balance-amount">{{ balance.formattedAmount }} {{ balance.coinDenom }}</span>
                </div>
              </div>
            </div>
            
            <button @click="fetchAllBalances" class="refresh-button">
              Refresh Balances
            </button>
            <button @click="disconnectWallet" class="disconnect-button">Disconnect Wallet</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wallet-page {
  padding: 2rem;
}

.wallet-container {
  max-width: 800px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.wallet-content h1 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

.connect-button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  width: 100%;
  margin-bottom: 1rem;
  transition: background-color 0.3s;
}

.keplr-button {
  background: #6366f1;
}

.leap-button {
  background: #2563eb;
}

.connect-button:hover {
  opacity: 0.9;
}

.wallet-description {
  text-align: center;
  color: #666;
  margin-bottom: 1rem;
}

.error-message {
  color: #dc2626;
  text-align: center;
  margin-top: 1rem;
}

.info-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
}

.address, .wallet-type {
  word-break: break-all;
  background: #e2e8f0;
  padding: 0.75rem;
  border-radius: 6px;
  margin: 1rem 0;
}

.balances-section {
  margin-top: 2rem;
}

.balance-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.network-name {
  font-weight: 600;
  color: #1f2937;
}

.balance-amount {
  color: #059669;
  font-weight: 600;
}

.refresh-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s;
}

.refresh-button:hover {
  background: #2563eb;
}

.disconnect-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
  margin-left: 1rem;
  transition: background-color 0.3s;
}

.disconnect-button:hover {
  background: #dc2626;
}
.success-message {
  background: linear-gradient(135deg, #ff4d4d, #ff8533, #ffcc00);
  color: white;
  padding: 2.5rem;
  border-radius: 16px;
  margin-bottom: 2.5rem;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 165, 0, 0.5);
  box-shadow: 0 0 20px rgba(255, 69, 0, 0.6);
  animation: burning 3s infinite alternate;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.success-message::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shine 2s infinite;
}

.success-message p {
  margin: 1rem 0;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  line-height: 1.6;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  transform-origin: center;
  animation: pulse 2s infinite;
}

.success-message:hover {
  transform: scale(1.02);
  box-shadow: 0 0 30px rgba(255, 69, 0, 0.8);
}

@keyframes burning {
  0% {
    background: linear-gradient(135deg, #ff4d4d, #ff8533, #ffcc00);
  }
  100% {
    background: linear-gradient(135deg, #ff8533, #ffcc00, #ff4d4d);
  }
}

@keyframes shine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.info-section {
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.info-section h2 {
  color: #4338ca;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.address, .wallet-type {
  background: rgba(243, 244, 246, 0.8);
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin: 1rem 0;
  font-family: 'Monaco', monospace;
  font-size: 0.95rem;
  color: #1f2937;
  border: 1px solid rgba(209, 213, 219, 0.5);
  transition: all 0.3s ease;
}

.address:hover, .wallet-type:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(31, 38, 135, 0.1);
}

.balances-section {
  margin-top: 2.5rem;
}

.balances-section h3 {
  color: #4338ca;
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.balance-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.balance-item {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(243, 244, 246, 0.9));
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid rgba(209, 213, 219, 0.5);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.balance-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(31, 38, 135, 0.1);
}

.network-name {
  font-weight: 600;
  color: #4338ca;
  font-size: 1.1rem;
}

.balance-amount {
  color: #047857;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.loading-message, .no-balances-message {
  text-align: center;
  color: #6b7280;
  font-size: 1.1rem;
  padding: 2rem;
  background: rgba(243, 244, 246, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(209, 213, 219, 0.5);
}
</style>