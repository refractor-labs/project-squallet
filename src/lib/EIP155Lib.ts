import { BigNumber, ethers, providers, Signer, Wallet } from 'ethers'
import { TransactionServiceI, TxService } from '@/lib/TransactionServiceI'
import { TransactionModel, UnsignedMpcTransaction } from '@/lib/Transaction'
import { TransactionServiceStore } from '@/lib/TxServiceStore'
import { LitWalletData } from '@/lib/lit/LitMpcWallet'
import { LitMpcWalletBrowserClient } from '@/lib/lit/LitMpcWalletBrowserClient'

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

/**
 * Library
 */
// export default class EIP155Lib implements IEIP155Lib {
//   orig: Wallet
//   wallet: Signer
//
//   constructor(wallet: Wallet) {
//     this.wallet = wallet
//     this.orig = wallet
//   }
//
//   static init({ mnemonic }: IInitArgs) {
//     const wallet = mnemonic ? Wallet.fromMnemonic(mnemonic) : Wallet.createRandom()
//
//     return new EIP155Lib(wallet)
//   }
//
//   async getAddress() {
//     return this.wallet.getAddress()
//   }
//
//   signMessage(message: string) {
//     return this.wallet.signMessage(message)
//   }
//
//   _signTypedData(domain: any, types: any, data: any) {
//     // @ts-ignore
//     return this.wallet._signTypedData(domain, types, data)
//   }
//
//   connect(provider: providers.JsonRpcProvider) {
//     return this.wallet.connect(provider)
//   }
//
//   signTransaction(transaction: providers.TransactionRequest) {
//     return this.wallet.signTransaction(transaction)
//   }
// }

const staticTransactionServiceStore = new TransactionServiceStore()

export class EIP155PkpLib implements IEIP155Lib {
  wallet: Signer
  readonly transactionService: TransactionServiceI
  readonly litClient: LitMpcWalletBrowserClient
  private abortFlag = false

  constructor(
    wallet: Signer,
    transactionService: TransactionServiceI,
    litClient: LitMpcWalletBrowserClient
  ) {
    this.wallet = wallet
    this.transactionService = transactionService
    this.litClient = litClient
  }

  static async init({ wallet, eoaSigner }: { eoaSigner: Signer; wallet: LitWalletData }) {
    console.log('fetcing chain id')
    const chainId = await eoaSigner.getChainId()
    const walletSigner = new ethers.VoidSigner(wallet.pkpAddress, eoaSigner.provider)
    console.log('VoidSigner', wallet)
    const litClient = new LitMpcWalletBrowserClient(wallet)
    //tx service should be scoped to the eoa signer
    const out = new EIP155PkpLib(
      walletSigner,
      new TxService(wallet.pkpAddress, eoaSigner, staticTransactionServiceStore),
      litClient
    )
    console.log('EIP155PkpLib', out)
    return out
  }

  getMnemonic() {
    return null
  }

  async getAddress() {
    return this.wallet.getAddress()
  }

  signMessage(message: string) {
    //todo
    return this.wallet.signMessage(message)
  }

  _signTypedData(domain: any, types: any, data: any) {
    // @ts-ignore
    return this.wallet._signTypedData(domain, types, data)
  }

  connect(provider: providers.JsonRpcProvider) {
    return this.wallet.connect(provider)
  }

  abortTransactions() {
    this.abortFlag = true
  }

  async signTransaction(transaction: providers.TransactionRequest) {
    console.log('got request signTransaction', transaction)
    const tx: UnsignedMpcTransaction = {
      nonce: toNumber(transaction.nonce),
      type: 2,
      maxFeePerGas: 0,
      maxPriorityFeePerGas: 0,
      from: await this.getAddress(),
      to: transaction.to || ethers.constants.AddressZero,
      value: transaction.value || '0x0',
      data: transaction.data || '0x',
      chainId: transaction.chainId || 0,
      gasLimit: transaction.gasLimit || '0x0'
    }
    console.log('tx', tx)
    const submitted = await this.transactionService.submitTransaction(tx)
    console.log('submitted', submitted)
    await this.transactionService.signTransaction(submitted.transaction)
    const hash = submitted.hash
    let foundTransaction: TransactionModel | undefined = undefined
    while (true) {
      foundTransaction = await this.transactionService.getTransaction(hash)
      if (foundTransaction && foundTransaction.signatures.length > 0) {
        break
      }
      if (this.abortFlag) {
        this.abortFlag = false
        throw new Error('Transaction aborted')
      }
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    if (foundTransaction) {
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
    // return this.wallet.signTransaction(transaction)
  }
}

const toNumber = (value: ethers.BigNumberish | undefined) => {
  return value ? BigNumber.from(value).toNumber() : 0
}
