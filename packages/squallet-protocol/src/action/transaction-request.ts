import type { SqualletTransactionRequest } from './transaction.types';
import { SqualletTransactionRequestClz } from './transaction.types';
import type { AccessListish } from '@ethersproject/transactions';
import type { BigNumberish } from '@ethersproject/bignumber';
import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';

function formatNumber(value: BigNumberish, name: string): Uint8Array {
    const result = ethers.stripZerosLeft(BigNumber.from(value).toHexString());
    if (result.length > 32) {
        throw new Error('invalid ' + name);
    }
    return result;
}

function formatAccessList(value: AccessListish): Array<[string, Array<string>]> {
    return ethers.accessListify(value).map((set) => [set.address, set.storageKeys]);
}

export const serializeTransactionRequest = (tx: SqualletTransactionRequest) => {
    const transaction = SqualletTransactionRequestClz.from(tx);
    const fields = [
        formatNumber(transaction.chainId || 0, 'chainId'),
        formatNumber(transaction.nonce || 0, 'nonce'),
        formatNumber(transaction.maxFee || 0, 'maxFee'),
        formatNumber(transaction.governanceVersion || 0, 'governanceVersion'),
        formatNumber(transaction.maxPriorityFeePerGas || 0, 'maxPriorityFeePerGas'),
        formatNumber(transaction.maxFeePerGas || 0, 'maxFeePerGas'),
        formatNumber(transaction.gasLimit || 0, 'gasLimit'),
        transaction.to != null ? ethers.getAddress(transaction.to) : '0x',
        formatNumber(transaction.value || 0, 'value'),
        transaction.data || '0x',
        formatAccessList(transaction.accessList || []),
    ];

    return ethers.utils.hexConcat(['0x02', ethers.utils.RLP.encode(fields)]);
};

export const hashTransactionRequest = (tx: SqualletTransactionRequest): string => {
    return ethers.hashMessage(serializeTransactionRequest(tx));
};
