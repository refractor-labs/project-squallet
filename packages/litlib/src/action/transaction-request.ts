import { TransactionRequest, TransactionRequestI } from './transaction.types'
import { AccessListish } from '@ethersproject/transactions'
import ethers from 'ethers'

function formatNumber(value: ethers.BigNumberish, name: string): Uint8Array {
  const result = ethers.utils.stripZeros(ethers.BigNumber.from(value).toHexString())
  if (result.length > 32) {
    throw new Error('invalid ' + name)
  }
  return result
}
function formatAccessList(value: AccessListish): Array<[string, Array<string>]> {
  return ethers.utils.accessListify(value).map(set => [set.address, set.storageKeys])
}
export const serializeTransactionRequest = (tx: TransactionRequestI) => {
  const transaction = TransactionRequest.from(tx)
  const fields = [
    formatNumber(transaction.chainId || 0, 'chainId'),
    formatNumber(transaction.nonce || 0, 'nonce'),
    formatNumber(transaction.maxFee || 0, 'maxFee'),
    formatNumber(transaction.maxPriorityFeePerGas || 0, 'maxPriorityFeePerGas'),
    formatNumber(transaction.maxFeePerGas || 0, 'maxFeePerGas'),
    formatNumber(transaction.gasLimit || 0, 'gasLimit'),
    transaction.to != null ? ethers.utils.getAddress(transaction.to) : '0x',
    formatNumber(transaction.value || 0, 'value'),
    transaction.data || '0x',
    formatAccessList(transaction.accessList || [])
  ]

  return ethers.utils.hexConcat(['0x02', ethers.utils.RLP.encode(fields)])
}

export const hashTransactionRequest = (tx: TransactionRequestI): string => {
  return ethers.utils.hashMessage(serializeTransactionRequest(tx))
}
