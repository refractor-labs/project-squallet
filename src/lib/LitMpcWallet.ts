import { providers, Signer } from 'ethers'

export interface LitMpcWallet {
  getAddress(): Promise<string>

  signMessage(message: string): any

  _signTypedData(domain: any, types: any, data: any): any

  signTransaction(transaction: providers.TransactionRequest): any
}
