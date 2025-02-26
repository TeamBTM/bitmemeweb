import { JUNO_TESTNET } from './config'

const FAUCET_URL = 'https://faucet.testnet.chaintools.tech/uni-6'
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export class FaucetError extends Error {
  constructor(message, status = null) {
    super(message)
    this.name = 'FaucetError'
    this.status = status
  }
}

export const requestTestnetTokens = async (address) => {
  if (!address?.startsWith('juno1')) {
    throw new FaucetError('Invalid Juno address format')
  }

  let lastError
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${FAUCET_URL}/${address}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new FaucetError(
          `Faucet request failed (${response.status})`,
          response.status
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      lastError = error instanceof FaucetError ? error : new FaucetError(
        error.message || 'Network error occurred'
      )
      
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY)
        continue
      }
    }
  }

  throw lastError
}

export const getWalletBalance = async (address) => {
  const MAX_RETRIES = 3;
  const TIMEOUT_MS = 5000;
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Validate RPC endpoint
      const rpcCheck = await Promise.race([
        fetch(`${JUNO_TESTNET.rpcEndpoint}/status`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('RPC check timeout')), TIMEOUT_MS)
        )
      ]);

      if (!rpcCheck.ok) {
        throw new Error(`RPC endpoint error: ${rpcCheck.status}`);
      }

      // Initialize Keplr client
      if (!window.keplr || !window.CosmJS) {
        throw new Error('Keplr or CosmJS not available');
      }

      const client = await window.keplr.getOfflineSignerOnlyAmino(JUNO_TESTNET.chainId);
      if (!client) {
        throw new Error('Failed to initialize Keplr client');
      }

      // Initialize CosmJS client with timeout
      const cosmJS = await Promise.race([
        window.CosmJS.SigningStargateClient.connectWithSigner(
          JUNO_TESTNET.rpcEndpoint,
          client
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('CosmJS client initialization timeout')), TIMEOUT_MS)
        )
      ]);

      if (!cosmJS) {
        throw new Error('Failed to initialize CosmJS client');
      }

      // Fetch balance with timeout
      const balanceResponse = await Promise.race([
        cosmJS.getBalance(address, 'ujunox'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Balance fetch timeout')), TIMEOUT_MS)
        )
      ]);

      if (!balanceResponse?.amount) {
        throw new Error('Invalid balance response');
      }

      return balanceResponse.amount;
    } catch (error) {
      lastError = error;
      console.error(`Balance fetch attempt ${attempt} failed:`, error);

      if (attempt < MAX_RETRIES) {
        // Exponential backoff with jitter
        const baseDelay = Math.pow(2, attempt) * 1000;
        const jitter = Math.random() * 1000;
        await sleep(baseDelay + jitter);
      }
    }
  }

  throw new Error(`Failed to fetch wallet balance after ${MAX_RETRIES} attempts: ${lastError.message}`);
}