import type { BytesLike } from '@ethersproject/bytes';
import type { AccessListish, UnsignedTransaction } from '@ethersproject/transactions';
import type { BigNumberish } from '@ethersproject/bignumber';
import type {
    TransactionRequest as TransactionRequestEthers,
    FeeData,
} from 'ethers';

// A transient transaction that includes fee data.
export interface UnsignedMpcTransaction extends UnsignedTransaction {
    to: string;
    from: string;
    nonce: number;

    gasLimit: BigNumberish;
    gasPrice?: undefined; // gasPrice not supported

    data?: BytesLike;
    value?: BigNumberish;
    chainId: number;

    type: 2;
    accessList?: AccessListish;

    maxPriorityFeePerGas: BigNumberish;
    maxFeePerGas: BigNumberish;
}

export const createFeeData = (fee: FeeData): SqualletFeeData => {
    if (!fee.maxFeePerGas || !fee.maxPriorityFeePerGas) {
        throw new Error('Fee data is missing');
    }
    return {
        maxFeePerGas: fee.maxFeePerGas,
        maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
    };
};
export interface SqualletFeeData {
    maxPriorityFeePerGas: BigNumberish;
    maxFeePerGas: BigNumberish;
}

export const createUnsignedMpcTransaction = (
    tx: SqualletTransactionRequest,
    fee: SqualletFeeData,
): UnsignedMpcTransaction => {
    return {
        to: tx.to,
        from: tx.from,
        nonce: tx.nonce,

        gasLimit: tx.gasLimit,
        gasPrice: undefined,

        data: tx.data,
        value: tx.value,
        chainId: tx.chainId,

        type: 2,
        accessList: tx.accessList,

        maxFeePerGas: fee.maxFeePerGas,
        maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
    };
};

export type OwnerSignature = {
    //must be checksumed
    signerAddress: string;
    // personal signature of the squallet transaction hash.
    signature: string;
};

export interface TransactionModel {
    transaction: SqualletTransactionRequest;
    signatures: OwnerSignature[];
}

// This is the squallet owner signed transaction
export interface SqualletTransactionRequest extends TransactionRequestEthers {
    to: string;
    from: string;
    nonce: number;

    gasLimit: BigNumberish;
    gasPrice?: undefined; // gasPrice not supported

    data?: BytesLike;
    value?: BigNumberish;
    chainId: number;

    type: 2;
    accessList?: AccessListish;

    maxPriorityFeePerGas?: undefined;
    maxFeePerGas?: undefined;

    //squallet specific fields
    // max fee user is willing to pay, in gwei
    maxFee: BigNumberish;
    // should always be the current governance version
    governanceVersion: BigNumberish;

    // customData?: Record<string, any>;
    // ccipReadEnabled?: boolean;
}

// Class implementation of TransactionRequestI with helper methods
export class SqualletTransactionRequestClz implements SqualletTransactionRequest {
    to: string;
    from: string;
    nonce: number;

    gasLimit: BigNumberish;
    gasPrice?: undefined;

    data?: BytesLike;
    value?: BigNumberish;
    chainId: number;

    type: 2;
    accessList?: AccessListish;

    maxPriorityFeePerGas?: undefined;
    maxFeePerGas?: undefined;

    maxFee: BigNumberish;
    governanceVersion: BigNumberish;

    private constructor(input: SqualletTransactionRequest) {
        this.to = input.to;
        this.from = input.from;
        this.nonce = input.nonce;
        this.gasLimit = input.gasLimit;
        this.gasPrice = undefined;
        this.data = input.data;
        this.value = input.value;
        this.chainId = input.chainId;
        this.type = 2;
        this.accessList = input.accessList;
        this.maxPriorityFeePerGas = undefined;
        this.maxFeePerGas = undefined;
        this.maxFee = input.maxFee;
        this.governanceVersion = input.governanceVersion;
    }
    static from(input: SqualletTransactionRequest) {
        return new SqualletTransactionRequestClz(input);
    }
}
