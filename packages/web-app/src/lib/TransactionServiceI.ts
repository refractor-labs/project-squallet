import { ethers } from 'ethers'
import { TransactionModel, UnsignedMpcTransaction } from '@/lib/Transaction'
import { TransactionServiceStore, TransactionServiceStoreI } from '@/lib/TxServiceStore'
import { hashUnsignedTransaction } from '@/lib/action/lit-lib'

export interface UserSignedTransaction {}

export interface TransactionServiceI {
  submitTransaction(transaction: UnsignedMpcTransaction): Promise<TransactionModel>

  signTransaction(transaction: UnsignedMpcTransaction): Promise<void>
  getTransaction(hash: string): Promise<TransactionModel | null>
}
export class TxService implements TransactionServiceI {
  readonly mpcWalletAddress: string
  readonly signer: ethers.Signer
  readonly store: TransactionServiceStoreI
  constructor(mpcWalletAddress: string, signer: ethers.Signer, store: TransactionServiceStoreI) {
    this.mpcWalletAddress = mpcWalletAddress
    this.signer = signer
    this.store = store
  }
  async submitTransaction(transaction: UnsignedMpcTransaction) {
    const out = this.store.save({
      walletAddress: this.mpcWalletAddress,
      transaction
    })
    console.log('submitTransaction', out)
    return out
  }
  //request the user sign the transaction
  async signTransaction(transaction: UnsignedMpcTransaction) {
    //todo this should be sign typed data
    const txHash = hashUnsignedTransaction(transaction)
    const signature = await this.signer.signMessage(txHash)
    console.log('signTransaction', txHash, signature)
    this.store.storeSignature(
      this.mpcWalletAddress,
      transaction,
      await this.signer.getAddress(),
      txHash,
      signature
    )
  }
  async getTransaction(hash: string): Promise<TransactionModel | null> {
    return this.store.getTransaction(this.mpcWalletAddress, hash)
  }
}
