<script setup>
import { ref } from 'vue'
import { JUNO_TESTNET } from '@/services/blockchain/config'
import { requestTestnetTokens as requestTokens, getWalletBalance } from '@/services/blockchain/faucet'

const isTestnet = ref(true)
const isConnected = ref(false)
const walletAddress = ref('')
const balance = ref('0')
const networkInfo = ref({
  chainId: '',
  chainName: '',
  rpc: '',
  rest: ''
})
const connectionError = ref('')

const formatBalance = (amount) => {
  return (parseInt(amount) / 1000000).toFixed(6)
}

const fetchBalanceWithRetry = async (address, errorPrefix = '') => {
  let retries = 3
  while (retries > 0) {
    try {
      if (!window.keplr || !window.CosmJS) {
        throw new Error('Keplr or CosmJS not available')
      }

      const client = await window.keplr.getOfflineSignerOnlyAmino(JUNO_TESTNET.chainId)
      if (!client) {
        throw new Error('Failed to initialize Keplr client')
      }

      const rpcCheck = await fetch(`${JUNO_TESTNET.rpcEndpoint}/status`)
      if (!rpcCheck.ok) {
        throw new Error('RPC endpoint not responding')
      }

      const cosmJS = await Promise.race([
        window.CosmJS.SigningStargateClient.connectWithSigner(
          JUNO_TESTNET.rpcEndpoint,
          client
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        )
      ])

      if (!cosmJS) {
        throw new Error('Failed to initialize CosmJS client')
      }

      const balanceResponse = await Promise.race([
        cosmJS.getBalance(address, 'ujunox'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Balance fetch timeout')), 5000)
        )
      ])

      if (!balanceResponse?.amount) {
        throw new Error('Invalid balance response')
      }

      balance.value = balanceResponse.amount
      connectionError.value = ''
      return balanceResponse.amount
    } catch (error) {
      console.error(`${errorPrefix} Balance fetch attempt ${4 - retries} failed:`, error)
      retries--
      
      if (retries === 0) {
        connectionError.value = `${errorPrefix} Could not get balance. Please check your internet connection and verify that the Juno network is working correctly.`
      } else {
        connectionError.value = `${errorPrefix} Attempting to get balance... (${retries} attempts remaining)`
        const baseDelay = Math.pow(2, 3 - retries) * 1000
        const jitter = Math.random() * 1000
        await new Promise(resolve => setTimeout(resolve, baseDelay + jitter))
      }
    }
  }
  throw new Error('Failed to fetch balance after all retries')
}

const updateNetworkInfo = () => {
  const config = isTestnet.value ? JUNO_TESTNET : JUNO_MAINNET
  networkInfo.value = {
    chainId: config.chainId,
    chainName: config.chainName,
    rpc: config.rpcEndpoint,
    rest: config.restEndpoint
  }
}

const connectJunoWallet = async () => {
  connectionError.value = ''
  try {
    if (!window.keplr) {
      connectionError.value = 'Please install the Keplr wallet to connect to Juno testnet'
      return
    }

    let currentRpcEndpoint = JUNO_TESTNET.rpcEndpoint;
    let isRpcValid = false;

    for (let i = 0; i < JUNO_TESTNET.rpcEndpoints.length && !isRpcValid; i++) {
      try {
        const rpcResponse = await fetch(`${currentRpcEndpoint}/status`);
        if (!rpcResponse.ok) {
          throw new Error(`RPC endpoint error: ${rpcResponse.status}`);
        }
        const rpcData = await rpcResponse.json();
        if (rpcData.result?.node_info?.network !== JUNO_TESTNET.chainId) {
          throw new Error('RPC endpoint connected to wrong network');
        }
        isRpcValid = true;
        JUNO_TESTNET.rpcEndpoint = currentRpcEndpoint;
        JUNO_TESTNET.restEndpoint = JUNO_TESTNET.apiEndpoints[i];
      } catch (error) {
        console.error(`RPC validation error for ${currentRpcEndpoint}:`, error);
        currentRpcEndpoint = JUNO_TESTNET.getNextRpcEndpoint(currentRpcEndpoint);
      }
    }

    if (!isRpcValid) {
      connectionError.value = 'Cannot connect to any Juno RPC node. Please try again later.';
      return;
    }

    try {
      await window.keplr.experimentalSuggestChain({
        chainId: JUNO_TESTNET.chainId,
        chainName: JUNO_TESTNET.chainName,
        rpc: JUNO_TESTNET.rpcEndpoint,
        rest: JUNO_TESTNET.restEndpoint,
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "juno",
          bech32PrefixAccPub: "junopub",
          bech32PrefixValAddr: "junovaloper",
          bech32PrefixValPub: "junovaloperpub",
          bech32PrefixConsAddr: "junovalcons",
          bech32PrefixConsPub: "junovalconspub"
        },
        currencies: [{
          coinDenom: "JUNOX",
          coinMinimalDenom: "ujunox",
          coinDecimals: JUNO_TESTNET.coinDecimals,
        }],
        feeCurrencies: [{
          coinDenom: "JUNOX",
          coinMinimalDenom: "ujunox",
          coinDecimals: JUNO_TESTNET.coinDecimals,
          gasPriceStep: {
            low: 0.025,
            average: 0.03,
            high: 0.04
          }
        }],
        stakeCurrency: {
          coinDenom: "JUNOX",
          coinMinimalDenom: "ujunox",
          coinDecimals: JUNO_TESTNET.coinDecimals,
        },
      })
    } catch (error) {
      console.error('Chain suggestion error:', error)
      connectionError.value = `Error configuring Juno network: ${error.message || 'Unknown error'}`
      return
    }

    try {
      await window.keplr.enable(JUNO_TESTNET.chainId)
    } catch (error) {
      console.error('Keplr enable error:', error)
      connectionError.value = 'Could not enable Keplr for Juno testnet'
      return
    }

    const offlineSigner = window.keplr.getOfflineSigner(JUNO_TESTNET.chainId)
    
    try {
      const accounts = await offlineSigner.getAccounts()
      if (accounts && accounts.length > 0) {
        walletAddress.value = accounts[0].address
        isConnected.value = true

        networkInfo.value = {
          chainId: JUNO_TESTNET.chainId,
          chainName: JUNO_TESTNET.chainName,
          rpc: JUNO_TESTNET.rpcEndpoint,
          rest: JUNO_TESTNET.restEndpoint
        }

        await fetchBalanceWithRetry(walletAddress.value, 'Initial')
      }
    } catch (error) {
      console.error('Account fetch error:', error)
      connectionError.value = 'Error al obtener la información de la cuenta'
      return
    }
  } catch (error) {
    console.error('Wallet connection error:', error)
    connectionError.value = `Error al conectar la billetera: ${error.message || 'Error desconocido'}`
  }
}

const disconnectWallet = () => {
  isConnected.value = false
  walletAddress.value = ''
  balance.value = '0'
  connectionError.value = ''
  networkInfo.value = {
    chainId: '',
    chainName: '',
    rpc: '',
    rest: ''
  }
}

const isRequestingTokens = ref(false)

const requestTestnetTokens = async () => {
  if (!walletAddress.value) return
  
  isRequestingTokens.value = true
  connectionError.value = ''

  try {
    await requestTokens(walletAddress.value)
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    await fetchBalanceWithRetry(walletAddress.value, 'Update')
  } catch (error) {
    console.error('Token request error:', error)
    connectionError.value = `Failed to request tokens: ${error.message || 'Unknown error'}`
  } finally {
    isRequestingTokens.value = false
  }
}
</script>

<template>
  <div class="wallet-page">
    <div class="wallet-container">
      <div class="wallet-content">
        <h1>Connect Your Juno Wallet</h1>
        <div v-if="!isConnected" class="connect-section">
          <div class="network-toggle">
            <span :class="{ active: !isTestnet }">Mainnet</span>
            <div class="toggle-switch" @click="isTestnet = !isTestnet">
              <div class="toggle-slider" :class="{ 'is-testnet': isTestnet }"></div>
            </div>
            <span :class="{ active: isTestnet }">Testnet</span>
          </div>
          <button @click="connectJunoWallet" class="connect-button">Connect Juno Wallet</button>
          <p class="wallet-description">Connect your Keplr wallet to interact with the Juno network</p>
          <p v-if="connectionError" class="error-message">{{ connectionError }}</p>
        </div>
        <div v-else class="wallet-info">
          <div class="info-section">
            <h2>Wallet Information</h2>
            <p class="address">Connected Address: {{ walletAddress }}</p>
            <p class="balance">Balance: {{ formatBalance(balance) }} {{ isTestnet ? 'JUNOX' : 'JUNO' }}</p>
            <div class="network-info">
              <h3>Network Information</h3>
              <p>Network: {{ networkInfo.chainName }}</p>
              <p>Chain ID: {{ networkInfo.chainId }}</p>
              <p>RPC: {{ networkInfo.rpc }}</p>
              <p>REST: {{ networkInfo.rest }}</p>
            </div>
            <p class="meme-message">🎭 Congrats! You're connected... but this is a meme project, so there's literally nothing to do here except vibing with your empty wallet! Go back, Click and Burn! 😎</p>
            <button 
              v-if="isTestnet"
              @click="requestTestnetTokens" 
              :disabled="isRequestingTokens"
              class="faucet-button">
              {{ isRequestingTokens ? 'Requesting...' : 'Request Test Tokens' }}
            </button>
            <button @click="disconnectWallet" class="disconnect-button">Disconnect Wallet</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-message {
  color: #ff4444;
  margin-top: 10px;
  text-align: center;
  font-size: 0.9em;
}

.wallet-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
}

.wallet-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 600px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.wallet-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.wallet-content h1 {
  text-align: center;
  color: #ffffff;
  margin-bottom: 40px;
  font-size: 2.5em;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #4CAF50, #45a049);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.network-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toggle-switch {
  width: 60px;
  height: 30px;
  background-color: #ddd;
  border-radius: 15px;
  margin: 0 10px;
  position: relative;
  cursor: pointer;
}

.toggle-slider {
  width: 26px;
  height: 26px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.toggle-slider.is-testnet {
  transform: translateX(30px);
  background-color: #4CAF50;
}

.network-toggle span {
  color: #666;
}

.network-toggle span.active {
  color: #4CAF50;
  font-weight: bold;
}

.connect-button, .disconnect-button, .faucet-button {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.connect-button {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.connect-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  background: linear-gradient(135deg, #45a049, #4CAF50);
}

.connect-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: 0.5s;
}

.connect-button:hover::before {
  left: 100%;
}

.disconnect-button {
  background: linear-gradient(135deg, #ff4444, #ff3333);
  color: white;
  margin-top: 20px;
  box-shadow: 0 4px 15px rgba(255, 68, 68, 0.3);
}

.disconnect-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 68, 68, 0.4);
  background: linear-gradient(135deg, #ff3333, #ff4444);
}

.faucet-button {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
  margin-top: 15px;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
}

.faucet-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
  background: linear-gradient(135deg, #1976D2, #2196F3);
}

.faucet-button:disabled {
  background: linear-gradient(135deg, #cccccc, #bbbbbb);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.wallet-description {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  margin: 20px 0;
  font-size: 1em;
  line-height: 1.6;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.wallet-info {
  margin-top: 20px;
}

.info-section, .network-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-section h2, .network-section h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.address, .balance {
  word-break: break-all;
  margin-bottom: 10px;
  color: #555;
}

.network-details p {
  margin: 5px 0;
  color: #555;
}

.network-details strong {
  color: #333;
}
.meme-message {
  text-align: center;
  color: #666;
  margin: 15px 0;
  font-size: 1em;
  font-style: italic;
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 8px;
  border: 1px dashed #4CAF50;
}
</style>