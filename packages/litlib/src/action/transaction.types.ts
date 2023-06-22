import ethers from 'ethers'
import { BytesLike } from '@ethersproject/bytes'
import { AccessListish } from '@ethersproject/transactions'

export interface UnsignedMpcTransaction {
  chainId: number
  nonce: number

  type: 2
  // EIP-1559; Type 2
  maxPriorityFeePerGas: ethers.BigNumberish
  maxFeePerGas: ethers.BigNumberish
  // maxPriorityFeePerGas: 0;
  // maxFeePerGas: 0;
  gasLimit: ethers.BigNumberish

  from: string
  to: string
  value?: ethers.BigNumberish
  data?: BytesLike

  //
  // // Typed-Transaction features
  // type:2;//1559 support only

  // EIP-2930; Type 1 & EIP-1559; Type 2
  accessList?: ethers.utils.AccessListish
}

export type OwnerSignature = { signerAddress: string; signature: string }

export interface TransactionModel {
  transaction: TransactionRequestI
  signatures: OwnerSignature[]

  hash: string
  walletAddress: string
}

//copy of ethers.providers.TransactionRequest but with non-null fields
export interface TransactionRequestI extends ethers.providers.TransactionRequest {
  to: string
  from: string
  nonce: number

  gasLimit: ethers.BigNumberish
  gasPrice?: undefined // gasPrice not supported

  data?: BytesLike
  value?: ethers.BigNumberish
  chainId: number

  type: 2
  accessList?: AccessListish

  maxPriorityFeePerGas?: undefined
  maxFeePerGas?: undefined

  // max fee user is willing to pay, in gwei
  maxFee: ethers.BigNumberish

  // customData?: Record<string, any>;
  // ccipReadEnabled?: boolean;
}

//copy of ethers.providers.TransactionRequest but with non-null fields
export class TransactionRequest implements TransactionRequestI {
  to: string
  from: string
  nonce: number

  gasLimit: ethers.BigNumberish
  gasPrice?: undefined

  data?: BytesLike
  value?: ethers.BigNumberish
  chainId: number

  type: 2
  accessList?: AccessListish

  maxPriorityFeePerGas?: undefined
  maxFeePerGas?: undefined

  maxFee: ethers.BigNumberish

  private constructor(input: TransactionRequestI) {
    this.to = input.to
    this.from = input.from
    this.nonce = input.nonce
    this.gasLimit = input.gasLimit
    this.gasPrice = input.gasPrice
    this.data = input.data
    this.value = input.value
    this.chainId = input.chainId
    this.type = input.type
    this.accessList = input.accessList
    this.maxPriorityFeePerGas = undefined
    this.maxFeePerGas = undefined
    this.maxFee = input.maxFee
  }
  static from(input: TransactionRequestI) {
    return new TransactionRequest(input)
  }
}
