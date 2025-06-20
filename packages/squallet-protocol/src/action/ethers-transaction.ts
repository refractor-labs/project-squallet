import type { SignatureLike } from '@ethersproject/bytes';
import type {
    SqualletTransactionRequest,
    TransactionModel,
    UnsignedMpcTransaction,
} from './transaction.types';
import { SqualletTransactionRequestClz } from './transaction.types';
import type { TypedDataDomain, TypedDataField } from 'ethers';
import type { Fee, SignTransactionRequest } from '../client';
import { hashTransactionRequest } from './transaction-request';
import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';

/**
 * Sign a standard transaction. Ignoring gas price and priority. Forces 1559 txns.
 * @param tx {UnsignedMpcTransaction}
 */
export const hashUnsignedTransaction = (tx: UnsignedMpcTransaction) => {
    return ethers.hashMessage(serializeUnsignedTransaction(tx));
};

/**
 * verify the model and equal to the transaction
 * @param signedTransaction
 * @param transaction
 */
export const equivalent = (
    signedTransaction: TransactionModel,
    transaction: SqualletTransactionRequest,
) => {
    //transaction is the one that was signed by the owner and will be broadcast
    return (
        ethers.utils.serializeTransaction(signedTransaction.transaction) ===
        ethers.utils.serializeTransaction(SqualletTransactionRequestClz.from(transaction))
    );
};

/**
 * Serialize a standard transaction for signing. Ignoring gas price and priority. Forces 1559 txns.
 * @param tx {UnsignedMpcTransaction}
 */
export const serializeUnsignedTransaction = (tx: UnsignedMpcTransaction): string => {
    return ethers.utils.serializeTransaction(copyUnsignedTransaction(tx));
};

export const copyUnsignedTransaction = (tx: UnsignedMpcTransaction): UnsignedMpcTransaction => {
    return {
        chainId: tx.chainId,
        nonce: tx.nonce,
        type: 2,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas, //todo fix these
        maxFeePerGas: tx.maxFeePerGas,
        gasLimit: tx.gasLimit,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        data: tx.data,
        accessList: tx.accessList,
    };
};

/**
 * Prepare a transaction for signing. Can be signed by the lit action with
 * ```
 *  const sigShare = await LitActions.signEcdsa({
 *     toSign: arrayifyUnsignedTransaction(unsignedTx),
 *     publicKey,
 *     sigName,
 * });
 * @param tx unsigned transaction
 */
export const arrayifyUnsignedTransaction = (tx: UnsignedMpcTransaction): Uint8Array => {
    return ethers.getBytes(ethers.getBytes(serializeUnsignedTransaction(tx)));
};

export const verifySignature = (
    transaction: SqualletTransactionRequest,
    signature: SignatureLike,
) => {
    const rawMessage = hashTransactionRequest(transaction);
    const message = ethers.toUtf8Bytes(rawMessage);
    return ethers.verifyMessage(message, signature);
};

export const verifyTypedDataSignature = (
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, any>,
    signature: SignatureLike,
) => {
    return ethers.verifyTypedData(domain, types, value, signature);
};

export const validAddress = (address: string) => {
    try {
        console.log(
            'checksum address in ',
            address,
            'address out',
            ethers.getAddress(address),
        );
        return ethers.getAddress(address) === address;
    } catch (e) {
        console.log('invalid address', address, e);
        return false;
    }
};

export const getFeeOk = (fee: Fee, tx: SqualletTransactionRequest) => {
    const txFeeGwei = BigNumber.from(fee.maxFeePerGas).mul(tx.gasLimit);
    console.log('fee.maxFeePerGas', fee.maxFeePerGas.toString());
    console.log('tx.gasLimit', tx.gasLimit.toString());
    console.log('gasGwei', txFeeGwei.toString());
    console.log('tx.maxFee', tx.maxFee.toString());
    return (
        // Max gas paid is less than the max fee
        txFeeGwei.lte(BigNumber.from(tx.maxFee)) &&
        // And baseFee is greater than 0. maybe needs an additional check here
        BigNumber.from(fee.maxFeePerGas).sub(fee.maxPriorityFeePerGas).gt(0)
    );
};
