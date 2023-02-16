import { LitMpcWallet, LitWalletData, WalletRequests, WalletResponse } from '@/lib/lit/LitMpcWallet'
import { LitContracts } from '@lit-protocol/contracts-sdk'
import LitJsSdk from 'lit-js-sdk'
import { litActions } from '@/components/lit-actions-code'

/**
 * Lit MPC client. This talks to the lit action, and makes sure the inputs are correctly formatted.
 * This also requests auth signatures from the user.
 */
export class LitMpcWalletBrowserClient implements LitMpcWallet {
  private readonly wallet: LitWalletData

  constructor(wallet: LitWalletData) {
    this.wallet = wallet
  }

  async sendRequest(request: WalletRequests): Promise<WalletResponse> {
    const cid = window.localStorage.getItem('multisig-cid')
    if (!cid) {
      throw new Error('multisig-cid not found in local storage, upload it first')
    }
    console.log('multisig-cid', cid)

    const litContracts = new LitContracts()
    await litContracts.connect()
    console.log('connected lit contract client')
    const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: 'serrano' })
    console.log('initialized lit client')
    await litNodeClient.connect()
    console.log('connected lit client')
    // get authentication signature to deploy call the action
    var authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: 'mumbai'
    })
    console.log('created auth sig', authSig)

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
      // code: litActions.multisig,
      ipfsId: cid,
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
