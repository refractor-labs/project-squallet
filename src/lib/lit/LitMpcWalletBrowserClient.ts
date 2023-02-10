import { providers, Signer } from 'ethers'
import { TransactionModel } from '@/lib/Transaction'
import { LitMpcWallet, LitWalletData, WalletRequests, WalletResponse } from '@/lib/lit/LitMpcWallet'
import { req } from 'pino-std-serializers'
import { LitContracts } from '@lit-protocol/contracts-sdk'
import LitJsSdk from 'lit-js-sdk'
import { litActions } from '@/components/lit-actions-code'

export class LitMpcWalletBrowserClient implements LitMpcWallet {
  private readonly wallet: LitWalletData

  constructor(wallet: LitWalletData) {
    this.wallet = wallet
  }

  async sendRequest(request: WalletRequests): Promise<WalletResponse> {
    const litContracts = new LitContracts()
    await litContracts.connect()
    const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: 'serrano' })
    await litNodeClient.connect()
    // get authentication signature to deploy call the action
    var authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: 'mumbai'
    })

    const sigName = 'sig1'
    const jsParams = {
      ...request,
      publicKey: this.wallet.publicKey,
      sigName: sigName
    }
    console.log('jsParams', jsParams)
    // this does both deployment action calling in the same code
    // need to break it down to upload to ipfs separately
    const resp = await litNodeClient.executeJs({
      code: litActions.multisig,
      authSig,
      // all jsParams can be used anywhere in your litActionCode
      jsParams
    })
    console.log('Lit action resp', resp)
    const { response, logs } = resp //todo parse response with zod
    console.log('Lit action response logs', logs)

    if (typeof response.success !== 'boolean' || !response.success) {
      return {
        success: false,
        error: 'lit action failed',
        data: null
      }
    }
    const signatureObj = resp.signatures[sigName]

    //todo send request to lit node
    return {
      success: true,
      data: signatureObj.signature
    }
  }
}
