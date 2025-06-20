import { TypedDataDomain, TypedDataField } from 'ethers';
import { OwnerSignature, TransactionModel, SqualletTransactionRequest } from '../action';
import { BigNumberish } from 'ethers';

// Interface for the squallet lit action. Makes sure interactions conform to the squallet json protocol.
export interface SqualletWalletTypes {
    sendRequest(
        request: WalletRequests,
        opts?: { litNetwork: string; walletNetwork: string },
    ): Promise<WalletResponse>;
}

// The response common interface
export interface WalletResponse {
    success: boolean;
    error?: string;
    data: any;
    signatures: Record<
        string,
        {
            dataSigned: string;
            publicKey: string;
            r: string;
            recid: number;
            s: string;
            signature: string;
        }
    >;
}

// all the support actions that the lit wallet can do. not final
export type WalletRequestTypes =
    | 'signMessage'
    | 'signTransaction'
    | 'signTypedData'
    | 'upgradeCode'
    | 'addSigner'
    | 'removeSigner';

export interface JsonRequestV1<T extends WalletRequestTypes, D> {
    version: '1.0';
    method: WalletRequestTypes;
    message: D;
}

export type SignTransactionRequest = JsonRequestV1<
    'signTransaction',
    {
        signedTransaction: TransactionModel;
        fee: Fee;
    }
>;

export interface Fee {
    //todo verify this somehow in the lit action. rn this value is ignored but sent to the blockchain.
    maxPriorityFeePerGas: BigNumberish;
    maxFeePerGas: BigNumberish;
}

//using eth personal sign
export type SignMessageRequest = JsonRequestV1<
    'signMessage',
    {
        message: string;
        signatures: OwnerSignature[];
    }
>;

//sign typed data
export type SignTypedDataRequest = JsonRequestV1<
    'signTypedData',
    {
        domain: TypedDataDomain;
        types: Record<string, Array<TypedDataField>>;
        value: Record<string, any>;
        signatures: OwnerSignature[];
    }
>;

export type UpgradeCodeRequest = JsonRequestV1<
    'upgradeCode',
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
    pkpPublicKey: string;
    pkpAddress: string;
    pkpId: string;
}
export type Action = {
    id: string;
    cid: string;
};
