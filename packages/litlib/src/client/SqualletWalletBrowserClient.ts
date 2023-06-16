import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { Signer } from "ethers";
import {
  LitWalletData,
  SqualletWalletTypes,
  WalletRequests,
  WalletResponse,
} from "./squallet-wallet.types";

/**
 * Lit MPC client. This talks to the lit action, and makes sure the inputs are correctly formatted.
 * This also requests auth signatures from the user.
 */
export class SqualletWalletBrowserClient implements SqualletWalletTypes {
  private readonly wallet: LitWalletData;
  private readonly signer: Signer;
  private readonly chainId: number;
  private readonly actionCid: string;

  constructor(
    wallet: LitWalletData,
    eoaSigner: Signer,
    chainId: number,
    actionCid: string
  ) {
    this.wallet = wallet;
    this.signer = eoaSigner;
    this.chainId = chainId;
    this.actionCid = actionCid;
  }

  async sendRequest(
    request: WalletRequests,
    {
      litNetwork,
      walletNetwork,
    }: { litNetwork: string; walletNetwork: string } = {
      litNetwork: "serrano",
      walletNetwork: "mumbai",
    }
  ): Promise<WalletResponse> {
    const cid = this.actionCid;
    if (!cid) {
      throw new Error("multisig-cid not found");
    }

    // const litContracts = new LitContracts()
    // await litContracts.connect()

    console.log("connected lit contract client");
    const litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: litNetwork,
    });
    console.log("initialized lit client");
    await litNodeClient.connect();
    console.log("connected lit client");
    // get authentication signature to deploy call the action
    var authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: walletNetwork,
    });
    console.log("created auth sig", authSig);

    const sigName = "sig1";
    const jsParams = {
      ...request,
      publicKey: this.wallet.pkpPublicKey,
      sigName: sigName,
    };
    console.log("jsParams", jsParams);

    // this does both deployment action calling in the same code
    // need to break it down to upload to ipfs separately
    const start = Date.now();
    const resp = await litNodeClient.executeJs({
      // code: litActions.multisig,
      ipfsId: cid,
      authSig,
      // all jsParams can be used anywhere in your litActionCode
      jsParams,
    });
    console.log("Lit action took", Date.now() - start, "ms");
    console.log("Lit action resp", resp);
    const { response, logs } = resp; //todo parse response with zod
    console.log("Lit action response logs", logs);

    if (!response) {
      return {
        success: false,
        error: "lit action failed",
        data: null,
      };
    }
    const signatureObj = resp.signatures[sigName];

    //todo send request to lit node
    return {
      success: true,
      data: signatureObj.signature,
    };
  }
}
