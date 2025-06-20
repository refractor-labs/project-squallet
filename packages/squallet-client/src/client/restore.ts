import { LitContracts } from '@lit-protocol/contracts-sdk';
import * as base58 from 'bs58';
import { InfuraProvider, JsonRpcProvider, Networkish, Provider } from 'ethers';
import { computeAddress } from '@ethersproject/transactions';

export const getChronicleProvider = () => {
    return new JsonRpcProvider('https://chain-rpc.litprotocol.com/http', 175177);
};

export const getInfuraProvider = (network: Networkish) => {
    return new InfuraProvider(network, process.env.INFURA_KEY as string);
};

export const restorePkpInfo = async (
    pkpId: string,
    opts?: { provider?: Provider; litContracts?: LitContracts },
) => {
    let litContracts: LitContracts;
    if (opts?.litContracts) {
        litContracts = opts.litContracts;
    } else {
        const provider = opts?.provider || getChronicleProvider();
        litContracts = opts?.litContracts || new LitContracts({ provider });
    }
    await litContracts.connect();
    const publicKeyPromise = litContracts.pkpNftContract.read.getPubkey(pkpId);

    const ownerPromise = litContracts.pkpNftContract.read.ownerOf(pkpId);
    const permittedActionsPromise =
        litContracts.pkpPermissionsContractUtil.read.getPermittedActions(pkpId);

    const [publicKey, owner, permittedActions] = await Promise.all([
        publicKeyPromise,
        ownerPromise,
        permittedActionsPromise,
    ]);

    const addressPkp = computeAddress(publicKey);
    return {
        pkpId: pkpId,
        pkpPublicKey: publicKey,
        pkpAddress: addressPkp,
        owner,
        permittedActions: permittedActions.map((a) => ({
            id: a,
            cid: hexToString(a),
        })),
    };
};
const hexToString = (hex: string): string => {
    const hashStr = base58.encode(fromHexString(hex.slice(2)));
    return hashStr;
};

const fromHexString = (hexString: string) =>
    Uint8Array.from((hexString.match(/.{1,2}/g) as any).map((byte: string) => parseInt(byte, 16)));
