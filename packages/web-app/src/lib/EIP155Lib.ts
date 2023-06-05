import { BigNumber, ethers, providers, Signer, Wallet } from 'ethers'
import { TransactionServiceI, TxService } from '@/lib/TransactionServiceI'
import {
  TransactionModel,
  TransactionRequestI,
  UnsignedMpcTransaction
} from '../../../litlib/transaction.types'
import { TransactionServiceStore, TransactionServiceStoreDb } from '@/lib/TxServiceStore'
import { LitWalletData } from '../../../litlib/squallet-wallet.types'
import { SqualletWalletBrowserClient } from '@/lib/lit/SqualletWalletBrowserClient'

/**
 * Types
 */
interface IInitArgs {
  mnemonic?: string
}

export interface IEIP155Lib {
  wallet: Signer

  getAddress(): Promise<string>

  signMessage(message: string): any

  _signTypedData(domain: any, types: any, data: any): any

  connect(provider: providers.JsonRpcProvider): any

  signTransaction(transaction: providers.TransactionRequest): any
}

// const staticTransactionServiceStore = new TransactionServiceStore()
const staticTransactionServiceStore = new TransactionServiceStoreDb()

/**
 * This connects the web2 transaction service with the lit action with wallet connect.
 * This is where the wallet comes to life.
 */
export class EIP155PkpLib implements IEIP155Lib {
  wallet: Signer
  readonly transactionService: TransactionServiceI
  readonly litClient: SqualletWalletBrowserClient
  private abortFlag = false

  constructor(
    wallet: Signer,
    transactionService: TransactionServiceI,
    litClient: SqualletWalletBrowserClient
  ) {
    this.wallet = wallet
    this.transactionService = transactionService
    this.litClient = litClient
  }

  static async init({ wallet, eoaSigner }: { eoaSigner: Signer; wallet: LitWalletData }) {
    console.log('EIP155PkpLib: fetching chain id')
    const chainId = await eoaSigner.getChainId()
    const walletSigner = new ethers.VoidSigner(wallet.pkpAddress, eoaSigner.provider)
    console.log('VoidSigner', wallet)
    const litClient = new SqualletWalletBrowserClient(wallet)
    //tx service should be scoped to the eoa signer
    const out = new EIP155PkpLib(
      walletSigner,
      new TxService(wallet.pkpAddress, eoaSigner, staticTransactionServiceStore),
      litClient
    )
    console.log('EIP155PkpLib is', out)
    return out
  }

  async getAddress() {
    return this.wallet.getAddress()
  }

  signMessage(message: string) {
    // todo
    return this.wallet.signMessage(message)
  }

  _signTypedData(domain: any, types: any, data: any) {
    //todo
    // @ts-ignore
    return this.wallet._signTypedData(domain, types, data)
  }

  connect(provider: providers.JsonRpcProvider) {
    //todo take this out
    return this.wallet.connect(provider)
  }

  abortTransactions() {
    this.abortFlag = true
  }

  async signTransaction(transaction: TransactionRequestI) {
    console.log('got request signTransaction', transaction)
    const tx: UnsignedMpcTransaction = {
      nonce: toNumber(transaction.nonce),
      type: 2,
      maxFeePerGas: 0,
      maxPriorityFeePerGas: 0,
      from: await this.getAddress(),
      to: transaction.to || ethers.constants.AddressZero,
      value: transaction.value || '0',
      data: transaction.data || '0x',
      chainId: transaction.chainId || 0,
      gasLimit: transaction.gasLimit || '0x0'
    }
    console.log('tx', tx)
    const submitted = await this.transactionService.submitTransaction(tx)
    console.log('submitted', submitted)
    await this.transactionService.signTransaction(submitted.transaction)
    console.log('signed transaction!')
    const hash = submitted.hash
    let foundTransaction: TransactionModel | null = null
    while (true) {
      foundTransaction = await this.transactionService.getTransaction(hash)
      if (foundTransaction && foundTransaction.signatures.length > 0) {
        break
      }
      if (this.abortFlag) {
        this.abortFlag = false
        throw new Error('Transaction aborted')
      }
      console.log('waiting for transaction', hash)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    if (foundTransaction) {
      console.log('found transaction', foundTransaction, 'sending lit request')
      //todo get the final transaction with all the gas values stored on it.
      //for now just use the Wallet conenct transaction
      const res = await this.litClient.sendRequest({
        method: 'signTransaction',
        request: {
          signedTransaction: foundTransaction,
          transaction
        }
      })
      console.log('lit result', res)
      return res.data
    } else {
      throw new Error('Transaction not found')
    }
  }
}

const toNumber = (value: ethers.BigNumberish | undefined) => {
  return value ? BigNumber.from(value).toNumber() : 0
}
