import { ethers } from 'ethers';
import { tokenContents } from 'helpers/compareSignature';

export const web3Sign = async (token: string, expiry: Date, address: any, library: any) => {
    try {
        const signature = await library.provider.jsonRpcFetchFunc('personal_sign', [
            ethers.hexlify(ethers.toUtf8Bytes(tokenContents(token, expiry.toISOString()))),
            address,
        ]);
        return signature;
    } catch (e) {
        console.log(e);
        return e;
    }
};
