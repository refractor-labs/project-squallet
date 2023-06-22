// import { SignatureLike, arrayify } from '@ethersproject/bytes'
import {
  TransactionModel,
  TransactionRequest,
  TransactionRequestI,
  UnsignedMpcTransaction
} from './transaction.types'
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'
// import { serialize } from '@ethersproject/transactions'
// import { hashMessage } from '@ethersproject/hash'
// import { getAddress } from '@ethersproject/address'
// import { verifyTypedData, verifyMessage } from '@ethersproject/wallet'
// import { toUtf8Bytes } from '@ethersproject/strings'
import { Fee } from '../client'
// import { BigNumber } from '@ethersproject/bignumber'
import { hashTransactionRequest } from './transaction-request'
import ethers from 'ethers'
import { SignatureLike } from '@ethersproject/bytes'

/**
 * Sign a standard transaction. Ignoring gas price and priority. Forces 1559 txns.
 * @param tx {UnsignedMpcTransaction}
 */
export const hashUnsignedTransaction = (tx: UnsignedMpcTransaction) => {
  return ethers.utils.hashMessage(serializeUnsignedTransaction(tx))
}

/**
 * verify the model and equal to the transaction
 * @param signedTransaction
 * @param transaction
 */
export const equivalent = (
  signedTransaction: TransactionModel,
  transaction: TransactionRequestI
) => {
  //transaction is the one that was signed by the owner and will be broadcast
  return (
    ethers.utils.serializeTransaction(signedTransaction.transaction) ===
    ethers.utils.serializeTransaction(TransactionRequest.from(transaction))
  )
}

/**
 * Serialize a standard transaction for signing. Ignoring gas price and priority. Forces 1559 txns.
 * @param tx {UnsignedMpcTransaction}
 */
export const serializeUnsignedTransaction = (tx: UnsignedMpcTransaction) => {
  return ethers.utils.serializeTransaction(copyUnsignedTransaction(tx))
}

export const copyUnsignedTransaction = (tx: UnsignedMpcTransaction): UnsignedMpcTransaction => {
  //copy it over so we know the properties
  // skip gas price and priority
  return {
    chainId: tx.chainId,
    nonce: tx.nonce,
    type: 2,
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas, //todo fix these
    maxFeePerGas: tx.maxFeePerGas,
    gasLimit: tx.gasLimit,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    data: tx.data,
    accessList: tx.accessList
  }
}

export const arrayifyUnsignedTransaction = (tx: UnsignedMpcTransaction) => {
  return ethers.utils.arrayify(serializeUnsignedTransaction(tx))
}

export const verifySignature = (transaction: TransactionRequestI, signature: SignatureLike) => {
  const rawMessage = hashTransactionRequest(transaction)
  const message = ethers.utils.toUtf8Bytes(rawMessage)
  return ethers.utils.verifyMessage(message, signature)
}

export const verifyTypedDataSignature = (
  domain: TypedDataDomain,
  types: Record<string, TypedDataField[]>,
  value: Record<string, any>,
  signature: SignatureLike
) => {
  return ethers.utils.verifyTypedData(domain, types, value, signature)
}

export const validAddress = (address: string) => {
  try {
    return ethers.utils.getAddress(address) === address
  } catch (e) {
    return false
  }
}

export const getFeeOk = (fee: Fee, tx: TransactionRequestI) => {
  const gasGwei = ethers.BigNumber.from(fee.maxFeePerGas).mul(tx.gasLimit)
  //return as eth
  console.log('fee.maxFeePerGas', fee.maxFeePerGas.toString())
  console.log('tx.gasLimit', tx.gasLimit.toString())
  console.log('gasGwei', gasGwei.toString())
  console.log('tx.maxFee', tx.maxFee.toString())
  return gasGwei.lte(ethers.BigNumber.from(tx.maxFee))
}
// 31500000378000
// 157500001890000
// 157500001890000 / 31500000378000=5 yay
