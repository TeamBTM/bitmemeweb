import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { GasPrice } from '@cosmjs/stargate'

export class JunoService {
  private static instance: JunoService
  private client: SigningCosmWasmClient | null = null
  private readonly chainId = 'juno-1'
  private readonly rpcEndpoint = import.meta.env.VITE_JUNO_RPC_URL
  private readonly contractAddress = import.meta.env.VITE_BTM_CONTRACT_ADDRESS

  private constructor() {}

  static getInstance(): JunoService {
    if (!JunoService.instance) {
      JunoService.instance = new JunoService()
    }
    return JunoService.instance
  }

  async connect() {
    if (!window.keplr) {
      throw new Error('Keplr wallet not found')
    }

    await window.keplr.enable(this.chainId)
    const offlineSigner = window.keplr.getOfflineSigner(this.chainId)
    
    this.client = await SigningCosmWasmClient.connectWithSigner(
      this.rpcEndpoint,
      offlineSigner,
      {
        gasPrice: GasPrice.fromString('0.025ujuno')
      }
    )

    return this.client
  }

  async burnTokens(clicks: number) {
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    const tokensToburn = Math.floor(clicks / 100)
    if (tokensToburn < 1) return

    try {
      const msg = {
        burn: {
          amount: (tokensToburn * 1_000_000).toString() // Convert to micro units
        }
      }

      const result = await this.client.execute(
        this.contractAddress,
        msg,
        'auto'
      )

      if (result.code === 0) {
        // Update local burn pool balance after successful burn
        await this.getBurnPoolBalance()
        return result
      } else {
        throw new Error(`Burn transaction failed: ${result.rawLog}`)
      }
    } catch (error) {
      console.error('Error during burn transaction:', error)
      throw error
    }
  }

  async getBurnPoolBalance(): Promise<string> {
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    const query = {
      balance: {
        address: this.contractAddress
      }
    }

    const result = await this.client.queryContractSmart(this.contractAddress, query)
    return result.balance
  }
}

export default JunoService.getInstance()