import { TransactionModel, UnsignedMpcTransaction } from '@/lib/Transaction'
import { hashUnsignedTransaction } from '@/lib/action/lit-lib'

export class TransactionServiceStore {
  private store = new Map<string, TransactionModel[]>()

  save(tx: {
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

  storeSignature(walletAddress: string, signer: string, hash: string, signature: string) {
    const list = this.store.get(walletAddress) || []
    const tx = list.find(t => t.hash === hash)
    if (!tx) {
      return
    }
    tx.signatures.push({
      signerAddress: signer,
      signature
    })
  }

  getTransaction(walletAddress: string, hash: string) {
    const list = this.store.get(walletAddress) || []
    return list.find(t => t.hash === hash)
  }
}
