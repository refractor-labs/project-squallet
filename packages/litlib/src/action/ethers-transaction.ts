import { SignatureLike, arrayify } from '@ethersproject/bytes'
import {
  TransactionModel,
  TransactionRequest,
  TransactionRequestI,
  UnsignedMpcTransaction
} from './transaction.types'
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'
import { serialize } from '@ethersproject/transactions'
import { hashMessage } from '@ethersproject/hash'
import { getAddress } from '@ethersproject/address'
import { verifyTypedData, verifyMessage } from '@ethersproject/wallet'
import { toUtf8Bytes } from '@ethersproject/strings'
import { Fee } from '../client'
import { BigNumber } from '@ethersproject/bignumber'
import { hashTransactionRequest } from './transaction-request'

/**
 * Sign a standard transaction. Ignoring gas price and priority. Forces 1559 txns.
 * @param tx {UnsignedMpcTransaction}
 */
export const hashUnsignedTransaction = (tx: UnsignedMpcTransaction) => {
  return hashMessage(serializeUnsignedTransaction(tx))
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
    serialize(signedTransaction.transaction) === serialize(TransactionRequest.from(transaction))
  )
}

/**
 * Serialize a standard transaction for signing. Ignoring gas price and priority. Forces 1559 txns.
 * @param tx {UnsignedMpcTransaction}
 */
export const serializeUnsignedTransaction = (tx: UnsignedMpcTransaction) => {
  return serialize(copyUnsignedTransaction(tx))
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
  return arrayify(serializeUnsignedTransaction(tx))
}

export const verifySignature = (transaction: TransactionRequestI, signature: SignatureLike) => {
  const rawMessage = hashTransactionRequest(transaction)
  const message = toUtf8Bytes(rawMessage)
  return verifyMessage(message, signature)
}

export const verifyTypedDataSignature = (
  domain: TypedDataDomain,
  types: Record<string, TypedDataField[]>,
  value: Record<string, any>,
  signature: SignatureLike
) => {
  return verifyTypedData(domain, types, value, signature)
}

export const validAddress = (address: string) => {
  try {
    console.log('checksum address in ', address, 'address out', getAddress(address))
    return getAddress(address) === address
  } catch (e) {
    console.log('invalid address', address, e)
    return false
  }
}

export const getFeeOk = (fee: Fee, tx: TransactionRequestI) => {
  const txFeeGwei = BigNumber.from(fee.maxFeePerGas).mul(tx.gasLimit)
  //return as eth
  console.log('fee.maxFeePerGas', fee.maxFeePerGas.toString())
  console.log('tx.gasLimit', tx.gasLimit.toString())
  console.log('gasGwei', txFeeGwei.toString())
  console.log('tx.maxFee', tx.maxFee.toString())
  return txFeeGwei.lte(BigNumber.from(tx.maxFee))
}
// 31500000378000
// 157500001890000
// 157500001890000 / 31500000378000=5 yay

//maxfee
// 315000004620000
// 1500000000* 21000=
// 31500000000000
