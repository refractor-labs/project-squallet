import { TransactionModel, UnsignedMpcTransaction } from '../../../litlib/transaction.types'
import { hashUnsignedTransaction } from '@/lib/action/lit-lib'
import { Signature, Transaction } from '@prisma/client'

export interface TransactionServiceStoreI {
  save(tx: {
    walletAddress: string
    transaction: UnsignedMpcTransaction
    signatures?: { signerAddress: string; signature: string }[]
  }): Promise<TransactionModel>

  storeSignature(
    walletAddress: string,
    transaction: UnsignedMpcTransaction,
    signer: string,
    hash: string,
    signature: string
  ): Promise<TransactionModel>

  getTransaction(walletAddress: string, hash: string): Promise<TransactionModel | null>

  getTransactions(walletAddress: string): Promise<TransactionModel[]>
}

export class TransactionServiceStore implements TransactionServiceStoreI {
  private store = new Map<string, TransactionModel[]>()

  async save(tx: {
    walletAddress: string
    transaction: UnsignedMpcTransaction
    signatures?: { signerAddress: string; signature: string }[]
  }) {
    const list = this.store.get(tx.walletAddress) || []
    const hash = hashUnsignedTransaction(tx.transaction)
    const found = list.find(t => t.hash === hash)
    if (found) {
      return found
    }
    const out = {
      ...tx,
      hash: hashUnsignedTransaction(tx.transaction),
      signatures: tx.signatures || []
    }
    list.push(out)
    this.store.set(tx.walletAddress, list)
    return out
  }

  async storeSignature(
    walletAddress: string,
    transaction: UnsignedMpcTransaction,
    signer: string,
    hash: string,
    signature: string
  ): Promise<TransactionModel> {
    const list = this.store.get(walletAddress) || []
    const tx = list.find(t => t.hash === hash)
    if (!tx) {
      throw new Error('Transaction not found')
    }
    tx.signatures.push({
      signerAddress: signer,
      signature
    })
    return tx
  }

  async getTransaction(walletAddress: string, hash: string): Promise<TransactionModel | null> {
    const list = this.store.get(walletAddress) || []
    return list.find(t => t.hash === hash) || null
  }

  async getTransactions(walletAddress: string): Promise<TransactionModel[]> {
    const list = this.store.get(walletAddress) || []
    return list
  }
}

export class TransactionServiceStoreDb implements TransactionServiceStoreI {
  async save(tx: {
    walletAddress: string
    transaction: UnsignedMpcTransaction
    signatures?: { signerAddress: string; signature: string }[]
  }) {
    const res = await fetch(this.baseUrl() + '/transactions', {
      method: 'POST',
      body: JSON.stringify({
        address: tx.walletAddress,
        transaction: tx.transaction
      }),
      headers: {
        'content-type': 'application/json'
      }
    })
    const json = (await res.json()) as { data: (Transaction & { signatures: Signature[] }) | null }
    if (!json.data) {
      throw new Error('Transaction not found')
    }
    console.log('saved', json.data)
    return this.mapTransaction(json.data)
  }

  async storeSignature(
    walletAddress: string,
    transaction: UnsignedMpcTransaction,
    signer: string,
    hash: string,
    signature: string
  ): Promise<TransactionModel> {
    const res = await fetch(this.baseUrl() + '/transactions/' + hash + '/sign', {
      method: 'PUT',
      body: JSON.stringify({
        address: walletAddress,
        transaction,
        signature,
        signerAddress: signer
      }),
      headers: {
        'content-type': 'application/json'
      }
    })
    const json = (await res.json()) as { data: (Transaction & { signatures: Signature[] }) | null }
    if (!json.data) {
      throw new Error('Transaction not found')
    }
    return this.mapTransaction(json.data)
  }

  private baseUrl() {
    const origin = process.env.NEXT_PUBLIC_TRANSACTION_API_URL
    console.log('origin', origin)
    return origin
  }
  async getTransaction(walletAddress: string, hash: string): Promise<TransactionModel | null> {
    const res = await fetch(this.baseUrl() + '/transactions/' + hash)
    const json = (await res.json()) as { data: (Transaction & { signatures: Signature[] }) | null }
    if (!json.data) {
      return null
    }

    return this.mapTransaction(json.data)
  }

  private mapTransaction(t: Transaction & { signatures: Signature[] }): TransactionModel {
    return {
      walletAddress: t.address,
      transaction: t.transaction as unknown as UnsignedMpcTransaction,
      signatures: t.signatures.map(s => ({
        signerAddress: s.signerAddress,
        signature: s.signature
      })),
      hash: t.signerHash
    }
  }

  async getTransactions(walletAddress: string): Promise<TransactionModel[]> {
    const res = await fetch(this.baseUrl() + '/transactions?address=' + walletAddress)
    console.log('res', res)
    console.log(res.headers.get('Content-Type'))
    // const body = await res.text()
    // console.log('body', body)
    const json = (await res.json()) as { data: (Transaction & { signatures: Signature[] })[] }
    console.log('json', json)
    // const json = (await res.json()) as (Transaction & { signatures: Signature[] })[]
    try {
      return json.data.map(t => {
        return this.mapTransaction(t)
      })
    } catch (e) {
      console.log('e', e)
      throw e
    }
  }
}
