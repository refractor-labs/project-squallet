import { providers, TypedDataDomain } from "ethers";
import {
  OwnerSignature,
  TransactionModel,
  TransactionRequestI,
} from "./transaction.types";
import { TypedDataField } from "@ethersproject/abstract-signer";
import { SignatureLike } from "@ethersproject/bytes";
import { BytesLike } from "@ethersproject/bytes/src.ts";

// Interface for the squallet lit action. Makes sure interactions conform to the squallet json protocol.
export interface SqualletWalletTypes {
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
    transaction: TransactionRequestI;
  }
>;

//using eth personal sign
export type SignMessageRequest = JsonRequest<
  "signMessage",
  {
    //todo
    signedTransaction: TransactionModel;
    transaction: TransactionRequestI;
  }
>;

//sign typed data
export type SignTypedDataRequest = JsonRequest<
  "signTypedData",
  {
    domain: TypedDataDomain;
    types: Record<string, Array<TypedDataField>>;
    value: Record<string, any>;
    signatures: OwnerSignature[];
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
  | SignMessageRequest
  | SignTransactionRequest
  | SignTypedDataRequest
  | UpgradeCodeRequest;

export interface LitWalletData {
  publicKey: string;
  pkpAddress: string;
  pkpId: string;
}
