import { COSMOS_NETWORKS } from './networks';

export const queryAllBalances = async (keplr, address) => {
  const balances = [];

  for (const network of COSMOS_NETWORKS) {
    try {
      // Get the offline signer for this chain
      const offlineSigner = await keplr.getOfflineSignerOnlyAmino(network.chainId);
      
      // Connect to the chain
      const client = await window.CosmJS.SigningStargateClient.connectWithSigner(
        network.rpcEndpoint,
        offlineSigner
      );

      // Query balance
      const balance = await client.getBalance(address, network.denom);
      
      // Only add to the list if balance is greater than 0
      if (parseInt(balance.amount) > 0) {
        balances.push({
          chainId: network.chainId,
          chainName: network.chainName,
          denom: network.denom,
          coinDenom: network.coinDenom,
          amount: balance.amount,
          formattedAmount: (parseInt(balance.amount) / Math.pow(10, network.coinDecimals)).toFixed(6)
        });
      }
    } catch (error) {
      console.error(`Failed to query balance for ${network.chainName}:`, error);
      // Continue with other networks even if one fails
      continue;
    }
  }

  return balances;
};

export const formatBalance = (amount, decimals = 6) => {
  return (parseInt(amount) / Math.pow(10, decimals)).toFixed(6);
};