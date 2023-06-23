import { TransactionRequest, TransactionRequestI } from './transaction.types'
import { accessListify, AccessListish } from '@ethersproject/transactions'
import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { hexConcat, stripZeros } from '@ethersproject/bytes'
import { getAddress } from '@ethersproject/address'
import * as RLP from '@ethersproject/rlp'
import { hashMessage } from '@ethersproject/hash'

function formatNumber(value: BigNumberish, name: string): Uint8Array {
  const result = stripZeros(BigNumber.from(value).toHexString())
  if (result.length > 32) {
    throw new Error('invalid ' + name)
  }
  return result
}

function formatAccessList(value: AccessListish): Array<[string, Array<string>]> {
  return accessListify(value).map(set => [set.address, set.storageKeys])
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
    transaction.to != null ? getAddress(transaction.to) : '0x',
    formatNumber(transaction.value || 0, 'value'),
    transaction.data || '0x',
    formatAccessList(transaction.accessList || [])
  ]

  return hexConcat(['0x02', RLP.encode(fields)])
}

export const hashTransactionRequest = (tx: TransactionRequestI): string => {
  return hashMessage(serializeTransactionRequest(tx))
}
