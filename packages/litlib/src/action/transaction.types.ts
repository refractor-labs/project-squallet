import { BytesLike } from '@ethersproject/bytes'
import { AccessListish } from '@ethersproject/transactions'
import { BigNumberish } from '@ethersproject/bignumber'
import { TransactionRequest as TransactionRequestEthers } from '@ethersproject/providers'

export interface UnsignedMpcTransaction extends TransactionRequestEthers {
  to: string
  from: string
  nonce: number

  gasLimit: BigNumberish
  gasPrice?: undefined // gasPrice not supported

  data?: BytesLike
  value?: BigNumberish
  chainId: number

  type: 2
  accessList?: AccessListish

  maxPriorityFeePerGas: BigNumberish
  maxFeePerGas: BigNumberish
}

export type OwnerSignature = { signerAddress: string; signature: string }

export interface TransactionModel {
  transaction: TransactionRequestI
  signatures: OwnerSignature[]

  hash: string
  walletAddress: string
}

//copy of ethers.providers.TransactionRequest but with non-null fields
export interface TransactionRequestI extends TransactionRequest {
  to: string
  from: string
  nonce: number

  gasLimit: BigNumberish
  gasPrice?: undefined // gasPrice not supported

  data?: BytesLike
  value?: BigNumberish
  chainId: number

  type: 2
  accessList?: AccessListish

  maxPriorityFeePerGas?: undefined
  maxFeePerGas?: undefined

  // max fee user is willing to pay, in gwei
  maxFee: BigNumberish

  // customData?: Record<string, any>;
  // ccipReadEnabled?: boolean;
}

//copy of ethers.providers.TransactionRequest but with non-null fields
export class TransactionRequest implements TransactionRequestI {
  to: string
  from: string
  nonce: number

  gasLimit: BigNumberish
  gasPrice?: undefined

  data?: BytesLike
  value?: BigNumberish
  chainId: number

  type: 2
  accessList?: AccessListish

  maxPriorityFeePerGas?: undefined
  maxFeePerGas?: undefined

  maxFee: BigNumberish

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
