import { ethers } from 'ethers'
import { TransactionModel, UnsignedMpcTransaction } from '@/lib/Transaction'
import { TransactionServiceStore } from '@/lib/TxServiceStore'

export interface UserSignedTransaction {}

export interface TransactionServiceI {
  submitTransaction(transaction: UnsignedMpcTransaction): Promise<TransactionModel>

  signTransaction(transaction: UnsignedMpcTransaction): Promise<void>
  getTransaction(hash: string): Promise<TransactionModel | undefined>
}
export class TxService implements TransactionServiceI {
  readonly mpcWalletAddress: string
  readonly signer: ethers.Signer
  readonly store: TransactionServiceStore
  constructor(mpcWalletAddress: string, signer: ethers.Signer, store: TransactionServiceStore) {
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
    const serialized = ethers.utils.serializeTransaction(transaction)
    const txHash = ethers.utils.hashMessage(serialized)
    const signature = await this.signer.signMessage(txHash)
    console.log('signTransaction', txHash, signature)
    this.store.storeSignature(
      this.mpcWalletAddress,
      await this.signer.getAddress(),
      txHash,
      signature
    )
  }
  async getTransaction(hash: string): Promise<TransactionModel | undefined> {
    return this.store.getTransaction(this.mpcWalletAddress, hash)
  }
}
