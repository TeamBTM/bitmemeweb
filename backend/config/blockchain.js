export const JUNO_MAINNET = {
  chainId: 'juno-1',
  chainName: 'Juno',
  rpcEndpoints: [
    'https://juno-rpc.polkachu.com',
    'https://rpc-juno.ecostake.com',
    'https://juno-rpc.lavenderfive.com:443',
    'https://rpc-juno.pupmos.network'
  ],
  apiEndpoints: [
    'https://api-juno.pupmos.network',
    'https://rest-juno.ecostake.com',
    'https://juno-api.lavenderfive.com:443',
    'https://api.juno.pupmos.network'
  ],
  rpcEndpoint: 'https://juno-rpc.polkachu.com',
  restEndpoint: 'https://api-juno.pupmos.network',
  coinDecimals: 6,
  
  getNextRpcEndpoint: function(currentEndpoint) {
    const currentIndex = this.rpcEndpoints.indexOf(currentEndpoint);
    const nextIndex = (currentIndex + 1) % this.rpcEndpoints.length;
    return this.rpcEndpoints[nextIndex];
  },
  
  getNextApiEndpoint: function(currentEndpoint) {
    const currentIndex = this.apiEndpoints.indexOf(currentEndpoint);
    const nextIndex = (currentIndex + 1) % this.apiEndpoints.length;
    return this.apiEndpoints[nextIndex];
  }
};

export const JUNO_TESTNET = {
  chainId: 'uni-6',
  chainName: 'Juno Testnet',
  rpcEndpoints: [
    'https://juno-rpc.publicnode.com',
    'https://juno-testnet-rpc.polkachu.com',
    'https://juno-testnet-rpc.bluestake.net:443',
    'https://juno-testnet-rpc.stake-town.com:443'
  ],
  apiEndpoints: [
    'https://juno-api.publicnode.com',
    'https://juno-testnet-api.polkachu.com',
    'https://juno-testnet-api.bluestake.net',
    'https://juno-testnet-api.stake-town.com:443'
  ],
  rpcEndpoint: 'https://juno-rpc.publicnode.com', // Default RPC endpoint
  restEndpoint: 'https://juno-api.publicnode.com', // Default REST endpoint
  coinDecimals: 6,
  
  // Function to get next available RPC endpoint
  getNextRpcEndpoint: function(currentEndpoint) {
    const currentIndex = this.rpcEndpoints.indexOf(currentEndpoint);
    const nextIndex = (currentIndex + 1) % this.rpcEndpoints.length;
    return this.rpcEndpoints[nextIndex];
  },
  
  // Function to get next available API endpoint
  getNextApiEndpoint: function(currentEndpoint) {
    const currentIndex = this.apiEndpoints.indexOf(currentEndpoint);
    const nextIndex = (currentIndex + 1) % this.apiEndpoints.length;
    return this.apiEndpoints[nextIndex];
  }
};