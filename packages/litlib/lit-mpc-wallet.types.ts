import { providers } from "ethers";
import { TransactionModel } from "./transaction.types";

export interface LitMpcWalletTypes {
  sendRequest(request: WalletRequests): Promise<WalletResponse>;
}

// The response common interface
export interface WalletResponse {
  success: boolean;
  error?: string;
  data: any;
}

// all the support actions that the lit wallet can do. not final
export type WalletRequestTypes =
  | "signMessage"
  | "signTransaction"
  | "signTypedData"
  | "upgradeCode"
  | "addSigner"
  | "removeSigner";

export interface JsonRequest<T extends WalletRequestTypes, D> {
  method: WalletRequestTypes;
  request: D;
}

export type SignTransactionRequest = JsonRequest<
  "signTransaction",
  {
    signedTransaction: TransactionModel;
    // todo maybe get rid of this since we have to check both this and the model transaction
    transaction: providers.TransactionRequest;
  }
>;

export type SignMethodRequest = JsonRequest<
  "signMessage",
  {
    //todo
    signedTransaction: TransactionModel;
    transaction: providers.TransactionRequest;
  }
>;

export type SignTypedDataRequest = JsonRequest<
  "signTypedData",
  {
    //todo
    signedTransaction: TransactionModel;
    transaction: providers.TransactionRequest;
  }
>;

export type UpgradeCodeRequest = JsonRequest<
  "upgradeCode",
  {
    //todo add governance signatures
    codeId: TransactionModel;
  }
>;

export type WalletRequests =
  | SignMethodRequest
  | SignTransactionRequest
  | SignTypedDataRequest
  | UpgradeCodeRequest;

export interface LitWalletData {
  publicKey: string;
  pkpAddress: string;
  pkpId: string;
}
