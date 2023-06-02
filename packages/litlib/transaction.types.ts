import { BigNumberish, ethers } from 'ethers'
import { BytesLike } from '@ethersproject/bytes'

export interface UnsignedMpcTransaction {
  chainId: number
  nonce: number

  type: 2
  // EIP-1559; Type 2
  // maxPriorityFeePerGas?: BigNumberish
  // maxFeePerGas?: BigNumberish
  maxPriorityFeePerGas: 0
  maxFeePerGas: 0
  gasLimit: BigNumberish

  from: string
  to: string
  value: BigNumberish
  data: BytesLike

  //
  // // Typed-Transaction features
  // type:2;//1559 support only

  // EIP-2930; Type 1 & EIP-1559; Type 2
  accessList?: ethers.utils.AccessListish
}

export interface TransactionModel {
  transaction: UnsignedMpcTransaction
  signatures: { signerAddress: string; signature: string }[]

  hash: string
  walletAddress: string
}
