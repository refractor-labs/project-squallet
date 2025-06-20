import {
    replaceSignersInCode,
    factoryCreateWithMultisigConfig,
} from '@refactor-labs/squallet-client';
import { chronicleSigner } from './wallet';
import { ipfsWrapper } from './ipfs';

export const createSquallet = async (owners: string[], threshold: number) => {
    return factoryCreateWithMultisigConfig({
        signer: chronicleSigner,
        ipfs: ipfsWrapper,
        code: await replaceSignersInCode(owners, threshold),
        owners,
        threshold,
    });
};
