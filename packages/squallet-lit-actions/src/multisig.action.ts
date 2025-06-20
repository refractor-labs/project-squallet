/**
 * NAME: multisig
 */

import {
    arrayifyUnsignedTransaction,
    createUnsignedMpcTransaction,
    getFeeOk,
    hashTransactionRequest,
    multisigConfigAbi,
    SignMessageRequest,
    SignTransactionRequest,
    validAddress,
    verifyMessage,
    verifySignature,
    verifyTypedDataSignature,
    WalletRequests,
    PkpConfig,
} from '@refactor-labs/squallet-protocol';
import { ethers, Interface } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';

// const authorizedAddresses = ['%%OWNER_ADDRESS%%'];
// const threshold = 11337012321;
const msConfigAddress = '0x039cFDb419f2E2A88378eb88588a3745D8F3078a';

const setResponse = (response: any) => {
    return LitActions.setResponse({
        response: JSON.stringify(response),
    });
};
const errorResponse = (message: any) => {
    return setResponse({ success: false, data: message });
};
const successResponse = (message: any) => {
    return setResponse({ success: true, data: message });
};

const allowedMethods: string[] = ['signMessage', 'signTransaction', 'signTypedData'];

const governanceForMethod: Record<
    string,
    (input: Input, config: PkpConfig) => boolean | undefined | void
> = {
    signMessage: (input: Input, config: PkpConfig) => {
        const { message: requMessage, method } = input.request as SignMessageRequest;
        const { message, signatures } = requMessage;
        const { threshold, owners } = config;
        if (threshold.gt(signatures.length)) {
            return errorResponse('Not enough signatures');
        }
        if (threshold.lt(signatures.length)) {
            return errorResponse('Too many signatures');
        }

        const authorizedAddressesCopy = [...owners];
        for (const signature of signatures) {
            if (!validAddress(signature.signerAddress)) {
                return errorResponse('address not checksummed');
            }
            if (authorizedAddressesCopy.includes(signature.signerAddress)) {
                authorizedAddressesCopy.splice(
                    authorizedAddressesCopy.indexOf(signature.signerAddress),
                    1,
                );
            } else {
                return errorResponse('address not authorized: ' + signature.signerAddress);
            }
        }
        const thresholdNumber = threshold.toNumber();
        for (let i = 0; i < signatures.length && i < thresholdNumber; i++) {
            const { signerAddress, signature } = signatures[i];
            console.log('signerAddress', signerAddress, 'signature', signature);
            const recoveredAddress = verifyMessage(message, signature, config.governanceVersion);
            console.log('recoveredAddress', recoveredAddress, 'expected', signerAddress);

            if (recoveredAddress !== signerAddress) {
                console.log('Failed to verify signature!');
                return errorResponse('invalid signature');
            }
        }
        return true;
    },
    signTypedData: (input: Input, config: PkpConfig) => {
        //sign typed data metamask
        //https://github.com/MetaMask/eth-sig-util/blob/fb40290810a443df2ae137b3de554f782fff79f9/src/sign-typed-data.ts#L538
        const {
            message: { domain, types, value, signatures },
            method,
        } = input.request;
        if (config.threshold.gt(signatures.length)) {
            return errorResponse('Not enough signatures');
        }
        if (config.threshold.lt(signatures.length)) {
            return errorResponse('Too many signatures');
        }

        const authorizedAddressesCopy = [...config.owners];
        for (const signature of signatures) {
            if (!validAddress(signature.signerAddress)) {
                return errorResponse('address not checksummed');
            }
            if (authorizedAddressesCopy.includes(signature.signerAddress)) {
                authorizedAddressesCopy.splice(
                    authorizedAddressesCopy.indexOf(signature.signerAddress),
                    1,
                );
            } else {
                return errorResponse('address not authorized: ' + signature.signerAddress);
            }
        }
        for (let i = 0; i < signatures.length && i < config.threshold.toNumber(); i++) {
            const { signerAddress, signature } = signatures[i];
            console.log('signerAddress', signerAddress, 'signature', signature);
            const recoveredAddress = verifyTypedDataSignature(domain, types, value, signature);
            console.log('recoveredAddress', recoveredAddress, 'expected', signerAddress);

            if (recoveredAddress !== signerAddress) {
                console.log('Failed to verify signature!');
                return errorResponse('invalid signature');
            }
        }
        return true;

        //todo
        //sign typed data metamask
        //https://github.com/MetaMask/eth-sig-util/blob/fb40290810a443df2ae137b3de554f782fff79f9/src/sign-typed-data.ts#L538
    },
    signTransaction: (input: Input, config: PkpConfig) => {
        //todo check format of request
        const { message, method } = input.request as SignTransactionRequest;
        const { signedTransaction, fee } = message;

        if (config.threshold.gt(signedTransaction.signatures.length)) {
            return errorResponse('Not enough signatures');
        }
        if (config.threshold.lt(signedTransaction.signatures.length)) {
            return errorResponse('Too many signatures');
        }

        console.log('signedTransaction', JSON.stringify(signedTransaction));
        // console.log('transaction', JSON.stringify(transaction))

        const authorizedAddressesCopy = [...config.owners];
        for (const signature of signedTransaction.signatures) {
            if (!validAddress(signature.signerAddress)) {
                return errorResponse('signer address not checksummed: ' + signature.signerAddress);
            }
            if (authorizedAddressesCopy.includes(signature.signerAddress)) {
                authorizedAddressesCopy.splice(
                    authorizedAddressesCopy.indexOf(signature.signerAddress),
                    1,
                );
            } else {
                return errorResponse('address not authorized: ' + signature.signerAddress);
            }
        }

        if (!getFeeOk(fee, signedTransaction.transaction)) {
            return errorResponse('fee too high');
        }

        const rawMessage = hashTransactionRequest({
            ...signedTransaction.transaction,
            // inject current governance version because this wallet only supports signing at the current version
            governanceVersion: config.governanceVersion,
        });
        console.log('hashToVerify', rawMessage);
        //todo use sign typed data
        for (
            let i = 0;
            i < signedTransaction.signatures.length && i < config.threshold.toNumber();
            i++
        ) {
            const { signerAddress, signature } = signedTransaction.signatures[i];
            console.log('signerAddress', signerAddress, 'signature', signature);
            const recoveredAddress = verifySignature(signedTransaction.transaction, signature);
            console.log('recoveredAddress', recoveredAddress, 'expected', signerAddress);

            if (recoveredAddress !== signerAddress) {
                console.log('Failed to verify signature!');
                return errorResponse('invalid signature');
            }
        }
        return true;
    },
};

type Input = { request: WalletRequests; sigName: any; publicKey: any };

const go = async () => {
    const input: Input = { request, sigName, publicKey };
    if (!allowedMethods.includes(input.request.method)) {
        console.log('Invalid method', input.request.method);
        return errorResponse('Invalid method');
    }
    const addressThis = ethers.computeAddress(input.publicKey);

    const getGovernanceParameters = async (): Promise<PkpConfig> => {
        const litProvider = new ethers.JsonRpcProvider(
            'https://chain-rpc.litprotocol.com/http',
            175177,
        );
        const contract = new ethers.Contract(
            msConfigAddress,
            new Interface(multisigConfigAbi),
            litProvider,
        );
        const tokenId = await LitActions.pubkeyToTokenId({ publicKey });
        console.log('tokenId', tokenId.toString());
        const config = await contract.getConfig(tokenId);
        console.log('config', JSON.stringify(config));
        const owners = config[0] as string[];
        const thresholdBn = config[1];
        const governanceVersion = (await contract.governanceVersion(tokenId)) as BigNumber;
        return { owners, threshold: thresholdBn, governanceVersion };
    };

    const config = await getGovernanceParameters();

    console.log(config, JSON.stringify(config));

    // @ts-ignore
    const ok = governanceForMethod[input.request.method](input, config);
    if (!ok) {
        return;
    }

    if (input.request.method === 'signMessage') {
        const request = input.request as SignMessageRequest;

        // todo support typed data eip712 as well as plain sign message
        const message = request.message.message;
        const sigShare = await LitActions.ethPersonalSignMessageEcdsa({
            message,
            publicKey,
            sigName,
        });
        return successResponse(message);
    } else if (input.request.method === 'signTransaction') {
        //transaction should have gas parameters in it.
        const request = input.request as SignTransactionRequest;
        // console.log('request is', JSON.stringify(request));
        // return errorResponse(`shortcircuit test`);
        const { signedTransaction, fee } = request.message;
        if (signedTransaction.transaction.from !== addressThis) {
            return errorResponse(`tx 'from' address should be this address`);
        }

        const latestNonce = await LitActions.getLatestNonce({
            address: addressThis,
            chain: 'ethereum',
        });
        console.log('latestNonce is', latestNonce);
        // if(latestNonce !== signedTransaction.transaction.nonce){
        const unsignedMpcTransaction = createUnsignedMpcTransaction(
            signedTransaction.transaction,
            fee,
        );
        console.log('tx is', JSON.stringify(unsignedMpcTransaction));
        // const unsignedTx = arrayifyUnsignedTransaction(unsignedMpcTransaction);
        const unsignedTx = arrayifyUnsignedTransaction(unsignedMpcTransaction);
        console.log('raw tx array', JSON.stringify(unsignedTx));
        const sigShare = await LitActions.signEcdsa({
            toSign: unsignedTx,
            publicKey,
            sigName,
        });

        return successResponse('ok');
    }
};

go();
