import { ipfsWrapper } from '../../utils';
import {
    factoryCreatePkp,
    factoryCreateWithMultisigConfig,
    getChronicleProvider,
    getInfuraProvider,
    SignMessageRequest,
    SignTransactionRequest,
    SqualletWalletBrowserClient,
} from '../../../src';
import {
    arrayifyUnsignedTransaction,
    createFeeData,
    createUnsignedMpcTransaction,
    formatSignMessage,
    hashTransactionRequest,
    multisigConfigAbi,
    SqualletTransactionRequest,
    UnsignedMpcTransaction,
} from '@refactor-labs/squallet-protocol';
import { ethers, Wallet, Interface, parseEther } from 'ethers';
import { replaceSignersInCode } from '../../../src/utils';
import { JsonRpcProvider } from 'ethers';
import fs from 'fs';
import { hashMessage } from '@ethersproject/hash';

describe('MultiSig', () => {
    //setup vars

    let pkp: {
        pkpId: string;
        pkpPublicKey: string;
        pkpAddress: string;
        owner: string;
        permittedActions: { id: any; cid: string }[];
        cid: string;
    };
    let provider: JsonRpcProvider;
    let signer: Wallet;
    let client: SqualletWalletBrowserClient;
    const chainId = 80001; //hardhat network chain id

    beforeAll(async () => {
        //setup
        const createNew = true;
        const fund = createNew;

        const signerChronicle = new ethers.Wallet(
            process.env.LIT_PRIVATE_KEY as string,
            getChronicleProvider(),
        );
        provider = getInfuraProvider(chainId);
        signer = new ethers.Wallet(process.env.LIT_PRIVATE_KEY as string, provider);

        const owners = [signer.address];
        const threshold = 1;
        const code = await replaceSignersInCode(owners, threshold);

        let pkpPromise: ReturnType<typeof factoryCreatePkp>;
        if (createNew) {
            // const pkpPromise1 = await factoryCreatePkp({
            //     signer: signerChronicle,
            //     ipfs: ipfsWrapper,
            //     code,
            // });
            pkpPromise = factoryCreateWithMultisigConfig({
                threshold,
                owners,
                signer: signerChronicle,
                ipfs: ipfsWrapper,
                code,
            });
            fs.writeFileSync(
                `${__dirname}/.pkps/pkp-${Math.round(Date.now() / 1000)}.json`,
                JSON.stringify(await pkpPromise, null, 2),
            );
        } else {
            pkpPromise = Promise.resolve({
                pkpId: '47645266076765302090894556743558349517969346204217472209952985110598119729302',
                pkpPublicKey:
                    '0x04cc609d513b99921d64fcb98408bdcb003c24d4e49c78b087a0cceb8fba53a2088e64e52ce4351081928de22a16b22adf3223c0190afcc72660a8c3df30396ee4',
                pkpAddress: '0x81C127627739E068D79A5EDBa3Fa15307afF179b',
                owner: '0x81C127627739E068D79A5EDBa3Fa15307afF179b',
                permittedActions: [
                    {
                        id: '0x1220d5bcf331d9fe0f3a9cc5897c54305d2797efad8d057f352a20d3500ca96bed65',
                        cid: 'Qmcizf621WHnu7dPdQpkv68yZ25rqzhjw9tQQQz335JgyJ',
                    },
                ],
                cid: 'Qmcizf621WHnu7dPdQpkv68yZ25rqzhjw9tQQQz335JgyJ',
            });
        }
        const contract = new ethers.Contract(
            '0x997833AE8f074b1eA29a8039f60e14F8295b12d6',
            new Interface(multisigConfigAbi),
            signerChronicle,
        );
        pkp = await pkpPromise;
        const config = await contract.getConfig(pkp.pkpId);

        console.log('pkp', JSON.stringify(pkp, null, 2));

        if (fund) {
            const tx = await signer.sendTransaction({
                to: pkp.pkpAddress,
                value: parseEther('0.001'),
            });
            await tx.wait();
            console.log('funded');
        }
        const balance = await provider.getBalance(pkp.pkpAddress);
        console.log('pkp balance', balance.toString());

        client = new SqualletWalletBrowserClient(pkp, signer, chainId, pkp.cid, { debug: true });
    });

    describe('signTransaction', () => {
        it('should sign a transaction with correct signatures', async () => {
            //
            //create a pkp here

            const fee = await provider.getFeeData();
            const estimate = await provider.estimateGas({
                to: pkp.pkpAddress,
                from: pkp.pkpAddress,
                value: '0x0',
            });

            const { maxFeePerGas, maxPriorityFeePerGas } = fee;
            if (!maxFeePerGas || !maxPriorityFeePerGas) {
                throw new Error('no fee');
            }

            const maxFee = estimate.mul(maxFeePerGas).mul(7);

            const tx: SqualletTransactionRequest = {
                to: pkp.pkpAddress,
                from: pkp.pkpAddress,
                nonce: 0,
                gasLimit: estimate.toString(),
                gasPrice: undefined,
                data: '0x',
                value: '0x0',
                chainId: chainId,
                type: 2,
                maxPriorityFeePerGas: undefined,
                maxFeePerGas: undefined,
                maxFee: maxFee.toString(),
                governanceVersion: 1,
            };
            const hash = hashTransactionRequest(tx);
            const request: SignTransactionRequest = {
                method: 'signTransaction',
                version: '1.0',
                message: {
                    fee: {
                        maxFeePerGas: maxFeePerGas.toString(),
                        maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
                    },
                    signedTransaction: {
                        // walletAddress: pkp.pkpAddress,
                        // hash,
                        signatures: [
                            {
                                signerAddress: ethers.getAddress(signer.address),
                                signature: await signer.signMessage(hash),
                            },
                        ],
                        transaction: tx,
                    },
                },
            };
            const res = await client.sendRequest(request);
            console.log('res', res);
            if (!res.success) {
                expect(res.success).toBeTruthy();
            }
        });

        it('should sign a transaction with correct signatures with a higher fee', async () => {
            const fee = await provider.getFeeData();
            const estimate = await provider.estimateGas({
                to: pkp.pkpAddress,
                from: pkp.pkpAddress,
                value: '0x0',
            });

            const { maxFeePerGas, maxPriorityFeePerGas } = fee;
            if (!maxFeePerGas || !maxPriorityFeePerGas) {
                throw new Error('no fee');
            }

            const maxFee = estimate.mul(maxFeePerGas).mul(7);

            const tx: SqualletTransactionRequest = {
                to: pkp.pkpAddress,
                from: pkp.pkpAddress,
                nonce: 0,
                gasLimit: estimate.toString(),
                gasPrice: undefined,
                data: '0x',
                value: '0x0',
                chainId: chainId,
                type: 2,
                maxPriorityFeePerGas: undefined,
                maxFeePerGas: undefined,
                maxFee: maxFee.toString(),
                governanceVersion: 1,
            };
            const hash = hashTransactionRequest(tx);

            const feeMult = [2, 7];
            for (const mult of feeMult) {
                const request: SignTransactionRequest = {
                    method: 'signTransaction',
                    version: '1.0',
                    message: {
                        fee: {
                            maxFeePerGas: maxFeePerGas.mul(mult).toString(),
                            maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
                        },
                        signedTransaction: {
                            signatures: [
                                {
                                    signerAddress: ethers.getAddress(signer.address),
                                    signature: await signer.signMessage(hash),
                                },
                            ],
                            transaction: tx,
                        },
                    },
                };
                const res = await client.sendRequest(request);
                console.log(mult, 'res', res);
                if (!res.success) {
                    expect(res.success).toBeTruthy();
                }
            }
        });

        it('should prevent sign a transaction with correct signatures with fee over limit', async () => {
            const fee = await provider.getFeeData();
            const estimate = await provider.estimateGas({
                to: pkp.pkpAddress,
                from: pkp.pkpAddress,
                value: '0x0',
            });

            const { maxFeePerGas, maxPriorityFeePerGas } = fee;
            if (!maxFeePerGas || !maxPriorityFeePerGas) {
                throw new Error('no fee');
            }

            const maxFee = estimate.mul(maxFeePerGas).mul(7);

            const tx: SqualletTransactionRequest = {
                to: pkp.pkpAddress,
                from: pkp.pkpAddress,
                nonce: 0,
                gasLimit: estimate.toString(),
                gasPrice: undefined,
                data: '0x',
                value: '0x0',
                chainId: chainId,
                type: 2,
                maxPriorityFeePerGas: undefined,
                maxFeePerGas: undefined,
                maxFee: maxFee.toString(),
                governanceVersion: 1,
            };
            const hash = hashTransactionRequest(tx);

            const request: SignTransactionRequest = {
                method: 'signTransaction',
                version: '1.0',
                message: {
                    fee: {
                        maxFeePerGas: maxFeePerGas.mul(8).toString(),
                        maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
                    },
                    signedTransaction: {
                        signatures: [
                            {
                                signerAddress: ethers.getAddress(signer.address),
                                signature: await signer.signMessage(hash),
                            },
                        ],
                        transaction: tx,
                    },
                },
            };
            const res = await client.sendRequest(request);
            console.log('res', res);
            expect(res.success).toBe(false);
            expect(res.data).toBe('lit action failed: fee too high');
        });

        it('should sign a transaction with correct signatures and broadcast', async () => {
            const fee = createFeeData(await provider.getFeeData());
            const estimate = await provider.estimateGas({
                to: pkp.pkpAddress,
                from: pkp.pkpAddress,
                value: '0x0',
            });

            const { maxFeePerGas, maxPriorityFeePerGas } = fee;
            if (!maxFeePerGas || !maxPriorityFeePerGas) {
                throw new Error('no fee');
            }

            const maxFee = estimate.mul(maxFeePerGas).mul(7);

            const tx: SqualletTransactionRequest = {
                to: pkp.pkpAddress,
                from: pkp.pkpAddress,
                nonce: 0,
                gasLimit: estimate.toString(),
                gasPrice: undefined,
                data: '0x',
                value: '0x0',
                chainId: chainId,
                type: 2,
                maxPriorityFeePerGas: undefined,
                maxFeePerGas: undefined,
                maxFee: maxFee.toString(),
                governanceVersion: 1,
            };
            const hash = hashTransactionRequest(tx);
            const request: SignTransactionRequest = {
                method: 'signTransaction',
                version: '1.0',
                message: {
                    fee: {
                        maxFeePerGas: maxFeePerGas.toString(),
                        maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
                    },
                    signedTransaction: {
                        signatures: [
                            {
                                signerAddress: ethers.getAddress(signer.address),
                                signature: await signer.signMessage(hash),
                            },
                        ],
                        transaction: tx,
                    },
                },
            };
            const res = await client.sendRequest(request);
            console.log('res', res);
            if (!res.success) {
                expect(res.success).toBeTruthy();
            }
            const unsignedTx: UnsignedMpcTransaction = createUnsignedMpcTransaction(tx, fee);
            const signedTransaction = ethers.utils.serializeTransaction(
                unsignedTx,
                res.signatures.sig1.signature,
            );
            const verifySignature = (transaction: UnsignedMpcTransaction, signature: string) => {
                const message = arrayifyUnsignedTransaction(transaction);
                const pk = ethers.utils.recoverPublicKey(message, signature);
                console.log('recovered public key: ', pk);
                return ethers.computeAddress(pk);
                return ethers.verifyMessage(message, signature);
            };

            expect(verifySignature(unsignedTx, res.signatures.sig1.signature)).toBe(pkp.pkpAddress);

            const network = await provider.getNetwork();
            console.log('network', network);
            console.log('unsignedTx', unsignedTx);
            console.log('balance', (await provider.getBalance(pkp.pkpAddress)).toString());

            // await senderTest();
            try {
                const sent = await provider.sendTransaction(signedTransaction);
                const receipt = await sent.wait();
                expect(receipt.status).toBe(1);
            } catch (e) {
                expect(e).toBe(undefined);
            }
        });

        //todo add negative tests
    });

    describe('signMessage', () => {
        it('should sign a message with correct signatures', async () => {
            // todo
            const message = 'hello multisig';
            // const hash = hashMessage(message);

            const signature = await signer.signMessage(formatSignMessage(message, 1));
            const request: SignMessageRequest = {
                method: 'signMessage',
                version: '1.0',
                message: {
                    message,
                    signatures: [
                        {
                            signature,
                            signerAddress: signer.address,
                        },
                    ],
                },
            };
            const response = await client.sendRequest(request);
            expect(response.success).toBe(true);
        });
    });

    describe.skip('code upgrade', () => {
        it('should broadcast 2 transactions in one block', async () => {
            //
            //create a pkp here

            const fee = await provider.getFeeData();
            const estimate = await provider.estimateGas({
                to: pkp.pkpAddress,
                from: pkp.pkpAddress,
                value: '0x0',
            });

            const { maxFeePerGas, maxPriorityFeePerGas } = fee;
            if (!maxFeePerGas || !maxPriorityFeePerGas) {
                throw new Error('no fee');
            }

            const maxFee = estimate.mul(maxFeePerGas).mul(7);

            const tx: SqualletTransactionRequest = {
                to: pkp.pkpAddress,
                from: signer.address,
                nonce: 0,
                gasLimit: estimate.toString(),
                gasPrice: undefined,
                data: '0x',
                value: '0x0',
                chainId: chainId,
                type: 2,
                maxPriorityFeePerGas: undefined,
                maxFeePerGas: undefined,
                maxFee: maxFee.toString(),
                governanceVersion: 1,
            };
            const hash = hashTransactionRequest(tx);
            const request: SignTransactionRequest = {
                method: 'signTransaction',
                version: '1.0',
                message: {
                    fee: {
                        maxFeePerGas: maxFeePerGas.toString(),
                        maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
                    },
                    signedTransaction: {
                        signatures: [
                            {
                                signerAddress: ethers.getAddress(signer.address),
                                signature: await signer.signMessage(hash),
                            },
                        ],
                        transaction: tx,
                    },
                },
            };
            const res = await client.sendRequest(request);
            console.log('res', res);
            if (!res.success) {
                expect(res.success).toBeTruthy();
            }
        });
    });
});
