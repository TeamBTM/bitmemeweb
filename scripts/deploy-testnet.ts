import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"
import { GasPrice } from "@cosmjs/stargate"
import { JUNO_TESTNET } from '../frontend/src/services/blockchain/config'
import * as fs from 'fs'

async function deployToTestnet() {
  const mnemonic = process.env.JUNO_TESTNET_MNEMONIC
  if (!mnemonic) {
    throw new Error("JUNO_TESTNET_MNEMONIC environment variable not set")
  }

  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: "juno",
  })

  const client = await SigningCosmWasmClient.connectWithSigner(
    JUNO_TESTNET.rpcEndpoint,
    wallet,
    { gasPrice: GasPrice.fromString(JUNO_TESTNET.gasPrice) }
  )

  const wasm = fs.readFileSync('../contracts/token/artifacts/btm.wasm')
  const accounts = await wallet.getAccounts()
  const deployer = accounts[0].address

  console.log('Deploying to Juno testnet...')
  console.log('Deployer address:', deployer)

  const uploadResult = await client.upload(deployer, wasm, "auto")
  console.log('Contract uploaded with code ID:', uploadResult.codeId)

  const instantiateMsg = {
    name: "BitMeme Testnet",
    symbol: "tBTM",
    decimals: 6,
    initial_balances: [],
    burn_pool_address: deployer,
    api_address: deployer
  }

  const contract = await client.instantiate(
    deployer,
    uploadResult.codeId,
    instantiateMsg,
    "BitMeme Testnet Token",
    "auto"
  )

  console.log('Contract instantiated at:', contract.contractAddress)
}

deployToTestnet().catch(console.error)