export const COSMOS_NETWORKS = [
  {
    chainId: 'juno-1',
    chainName: 'Juno',
    rpcEndpoint: 'https://juno-rpc.polkachu.com',
    restEndpoint: 'https://juno-api.polkachu.com',
    denom: 'ujuno',
    prefix: 'juno',
    coinDecimals: 6,
    coinDenom: 'JUNO'
  },
  {
    chainId: 'cosmoshub-4',
    chainName: 'Cosmos Hub',
    rpcEndpoint: 'https://rpc.cosmos.network',
    restEndpoint: 'https://api.cosmos.network',
    denom: 'uatom',
    prefix: 'cosmos',
    coinDecimals: 6,
    coinDenom: 'ATOM'
  },
  {
    chainId: 'osmosis-1',
    chainName: 'Osmosis',
    rpcEndpoint: 'https://rpc.osmosis.zone',
    restEndpoint: 'https://lcd.osmosis.zone',
    denom: 'uosmo',
    prefix: 'osmo',
    coinDecimals: 6,
    coinDenom: 'OSMO'
  },
  {
    chainId: 'akashnet-2',
    chainName: 'Akash',
    rpcEndpoint: 'https://rpc.akash.network',
    restEndpoint: 'https://api.akash.network',
    denom: 'uakt',
    prefix: 'akash',
    coinDecimals: 6,
    coinDenom: 'AKT'
  },
  {
    chainId: 'secret-4',
    chainName: 'Secret Network',
    rpcEndpoint: 'https://rpc.secret.network',
    restEndpoint: 'https://api.secret.network',
    denom: 'uscrt',
    prefix: 'secret',
    coinDecimals: 6,
    coinDenom: 'SCRT'
  }
];

export const getNetworkByChainId = (chainId) => {
  return COSMOS_NETWORKS.find(network => network.chainId === chainId);
};

export const getAllNetworks = () => COSMOS_NETWORKS;