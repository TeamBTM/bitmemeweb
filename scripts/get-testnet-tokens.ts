import fetch from 'node-fetch'

function isValidJunoAddress(address: string): boolean {
  return /^juno1[a-zA-Z0-9]{38}$/.test(address)
}

async function getFaucetTokens(address: string) {
  if (!isValidJunoAddress(address)) {
    throw new Error('Invalid Juno address format. Address must start with "juno1" followed by 38 alphanumeric characters.')
  }

  console.log('Connecting to Juno testnet faucet...')
  
  try {
    const response = await fetch('https://faucet.uni.juno.deuslabs.fi/credit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, denom: 'ujunox' }),
    })

    if (!response.ok) {
      throw new Error(`Faucet request failed with status: ${response.status}`)
    }

    const data = await response.json()
    console.log('\n✅ Success! Tokens have been sent to your wallet.')
    console.log('Transaction details:', data)
    console.log('\nNote: It may take a few moments for the tokens to appear in your wallet.')
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to request tokens: ${error.message}`)
    }
    throw error
  }
}

if (process.argv.length < 3) {
  console.log('\n❌ Error: Please provide your Juno testnet address as an argument')
  console.log('\nUsage: ts-node get-testnet-tokens.ts <juno-address>')
  console.log('Example: ts-node get-testnet-tokens.ts juno1abcd...')
  process.exit(1)
}

const testnetAddress = process.argv[2]
console.log('\nRequesting testnet tokens for address:', testnetAddress)

getFaucetTokens(testnetAddress).catch(error => {
  console.error('\n❌ Error:', error.message)
  process.exit(1)
})