import { ethers } from 'ethers'

/**
 * Sign a standard transaction. Ignoring gas price and priority. Forces 1559 txns.
 * @param tx {UnsignedMpcTransaction}
 */
export const hashUnsignedTransaction = tx => {
  return ethers.utils.hashMessage(serializeUnsignedTransaction(tx))
}

/**
 * Serialize a standard transaction for signing. Ignoring gas price and priority. Forces 1559 txns.
 * @param tx {UnsignedMpcTransaction}
 */
export const serializeUnsignedTransaction = tx => {
  //copy it over so we know the properties
  const txCopy = {
    chainId: tx.chainId,
    nonce: tx.nonce,
    type: 2,
    maxPriorityFeePerGas: 0,
    maxFeePerGas: 0,
    gasLimit: tx.gasLimit,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    data: tx.data,
    accessList: tx.accessList
  }
  return ethers.utils.serializeTransaction(txCopy)
}

export const verifySignature = (transaction, signature) => {
  const rawMessage = hashUnsignedTransaction(transaction)
  const message = ethers.utils.toUtf8Bytes(rawMessage)
  return ethers.utils.verifyMessage(message, signature)
}
