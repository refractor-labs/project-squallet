import {ethers, providers, Signer, Wallet} from 'ethers'

/**
 * Types
 */
interface IInitArgs {
  mnemonic?: string
}

export interface IEIP155Lib {
  wallet: Signer;

  getMnemonic(): any;

  getAddress(): Promise<string>;

  signMessage(message: string): any;

  _signTypedData(domain: any, types: any, data: any): any;

  connect(provider: providers.JsonRpcProvider): any;

  signTransaction(transaction: providers.TransactionRequest): any;
}

/**
 * Library
 */
export default class EIP155Lib implements IEIP155Lib {
  orig: Wallet
  wallet: Signer

  constructor(wallet: Wallet) {
    this.wallet = wallet
    this.orig = wallet
  }

  static init({ mnemonic }: IInitArgs) {
    const wallet = mnemonic ? Wallet.fromMnemonic(mnemonic) : Wallet.createRandom()

    return new EIP155Lib(wallet)
  }

  getMnemonic() {
    return this.orig.mnemonic.phrase
  }

  async getAddress() {
    return this.wallet.getAddress()
  }

  signMessage(message: string) {
    return this.wallet.signMessage(message)
  }

  _signTypedData(domain: any, types: any, data: any) {
    // @ts-ignore
    return this.wallet._signTypedData(domain, types, data)
  }

  connect(provider: providers.JsonRpcProvider) {
    return this.wallet.connect(provider)
  }

  signTransaction(transaction: providers.TransactionRequest) {
    return this.wallet.signTransaction(transaction)
  }
}


export  class EIP155PkpLib implements IEIP155Lib{
  wallet: Signer

  constructor(wallet: Signer) {
    this.wallet = wallet
    this.wallet.getAddress()

  }

  static init({ address }: { address: string }) {
    const wallet = new ethers.VoidSigner(address, ethers.getDefaultProvider('goerli'))
    return new EIP155PkpLib(wallet)
  }

  getMnemonic() {
    return null
  }

  async getAddress() {
    return this.wallet.getAddress()
  }

  signMessage(message: string) {
    return this.wallet.signMessage(message)
  }

  _signTypedData(domain: any, types: any, data: any) {
    // @ts-ignore
    return this.wallet._signTypedData(domain, types, data)
  }

  connect(provider: providers.JsonRpcProvider) {
    return this.wallet.connect(provider)
  }

  signTransaction(transaction: providers.TransactionRequest) {
    return this.wallet.signTransaction(transaction)
  }
}
