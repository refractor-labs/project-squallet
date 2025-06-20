import type { SignatureLike } from '@ethersproject/bytes';
import { ethers } from 'ethers';

// todo we should hash the message and wrap it in our own container so the user signature cannot be used for anything else
export const verifyMessage = (
    message: string,
    signature: SignatureLike,
    governanceVersion: ethers.BigNumberish,
) => {
    return ethers.verifyMessage(formatSignMessage(message, governanceVersion), signature);
};

export const formatSignMessage = (message: string, governanceVersion: ethers.BigNumberish) => {
    return `Squallet signature request:\n\n${message}\n\ngovernance version: ${governanceVersion.toString()}`;
};
