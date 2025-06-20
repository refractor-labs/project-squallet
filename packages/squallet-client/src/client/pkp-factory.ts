import { Wallet } from '@ethersproject/wallet';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { restorePkpInfo } from './restore';
import { MultiSigPkpFactory__factory } from '@refractor-labs/protocol-contracts/typechain';
import { matchEvents } from '@refractor-labs/shared-utils';
import bs58 from 'bs58';

interface IPFSUploader {
    (data: string): Promise<{ cid: string }>;
}
export const factoryCreatePkp = async ({
    signer,
    ipfs,
    code,
}: {
    // owners: string[];
    // threshold: number;
    code: string;
    signer: Wallet;
    ipfs: IPFSUploader;
}) => {
    // if (owners.length < threshold) {
    //   throw new Error("threshold must be less than or equal to owners.length");
    // }
    const ipfsCid = await ipfs(code);
    const newCid = ipfsCid.cid;

    const litContracts = new LitContracts({ signer });
    // console.log("litContracts", litContracts);
    await litContracts.connect();
    const mintCost = await litContracts.pkpNftContract.read.mintCost();
    // console.log("mintCost", mintCost);
    const tx = await litContracts.pkpNftContract.write.mintNext(2, {
        value: mintCost,
    });
    // console.log("tx", tx);
    const txResp = await tx.wait();
    // console.log("txResp", txResp);
    const transferEvent = txResp.events?.find((e: any) => e.event === 'Transfer');
    const pkpId = transferEvent?.topics[3] || '';

    const signerAddress = await litContracts.signer.getAddress();

    const pkp = await restorePkpInfo(pkpId.toString());
    const { pkpAddress } = pkp;

    await litContracts.pkpPermissionsContractUtil.write.addPermittedAction(pkpId, newCid);
    try {
        const transferTx = await litContracts.pkpNftContract.write.transferFrom(
            signerAddress,
            pkpAddress,
            pkpId,
        );
        await transferTx.wait();
    } catch (e) {
        console.log('transferTx error', e);
        throw e;
    }

    return { ...pkp, cid: newCid.toString() };
};

/**
 * MultisigConfig and MultiSifPkpFactory deployments to chronicle chain.
 */
const deployments = {
    version: '1',
    deployerAddress: '0x182351E16c1F511e50eA4438aFE3d0f16ae4769B',
    MultisigConfig: '0x039cFDb419f2E2A88378eb88588a3745D8F3078a',
    MultiSigPkpFactory: '0x66AAc4e6cCBC69Cc24050D13E601D78C016beb3e',
    domainName: 'MultisigConfig',
};
// prepare a ipfs cid string as a hex string for sending to the contract
const getBytesFromIpfsHash = (ipfsListing: string) => {
    return '0x' + Buffer.from(bs58.decode(ipfsListing)).toString('hex');
};
export const factoryCreateWithMultisigConfig = async ({
    signer,
    ipfs,
    code,
    owners,
    threshold,
}: {
    code: string;
    signer: Wallet;
    ipfs: IPFSUploader;
    owners: string[];
    threshold: number;
}) => {
    if (owners.length < threshold) {
        throw new Error('threshold must be less than or equal to owners.length');
    }
    const ipfsCid = await ipfs(code);
    const newCid = ipfsCid.cid;

    const factoryContract = MultiSigPkpFactory__factory.connect(
        deployments.MultiSigPkpFactory,
        signer,
    );
    const litContracts = new LitContracts({ signer });
    await litContracts.connect();
    const mintCost = await litContracts.pkpNftContract.read.mintCost();
    console.log('mintCost', mintCost.toString(), owners, threshold);
    const tx = await factoryContract.mintNextAndAddAuthMethodsWithTypes(
        2,
        [getBytesFromIpfsHash(newCid)],
        owners,
        threshold,
        {
            value: mintCost,
        },
    );

    const txResp = await tx.wait();
    const mints = matchEvents(
        txResp.events || [],
        factoryContract,
        factoryContract.filters.MultiSigPkpMinted(),
    );
    //event MultiSigPkpMinted(uint256 indexed tokenId, address pkpAddress, address[] owners, uint256 threshold);
    const pkpId = mints[0].args[0].toString();

    const pkp = await restorePkpInfo(pkpId.toString());

    return { ...pkp, cid: newCid.toString() };
};
