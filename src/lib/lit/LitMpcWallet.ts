import { providers, Signer } from 'ethers'
import { TransactionModel } from '@/lib/Transaction'

export interface LitMpcWallet {
  sendRequest(request: WalletRequests): Promise<WalletResponse>
}

export interface WalletResponse {
  success: boolean
  error?: string
  data: any
}

type WalletRequestTypes =
  | 'signMessage'
  | 'signTransaction'
  | 'signTypedData'
  | 'upgradeCode'
  | 'addSigner'
  | 'removeSigner'

interface JsonRequest<T extends WalletRequestTypes, D> {
  method: WalletRequestTypes
  request: D
}

type SignTransactionRequest = JsonRequest<
  'signTransaction',
  {
    signedTransaction: TransactionModel
    transaction: providers.TransactionRequest
  }
>

type SignMethodRequest = JsonRequest<
  'signMessage',
  {
    //todo
    signedTransaction: TransactionModel
    transaction: providers.TransactionRequest
  }
>

type SignTypedDataRequest = JsonRequest<
  'signTypedData',
  {
    //todo
    signedTransaction: TransactionModel
    transaction: providers.TransactionRequest
  }
>

type UpgradeCodeRequest = JsonRequest<
  'upgradeCode',
  {
    //todo add governance signatures
    codeId: TransactionModel
  }
>

export type WalletRequests =
  | SignMethodRequest
  | SignTransactionRequest
  | SignTypedDataRequest
  | UpgradeCodeRequest

export interface LitWalletData {
  publicKey: string
  pkpAddress: string
  pkpId: string
}
