import { JsonRpcProvider } from 'ethers';
import { Wallet } from 'ethers';

export const chronicleProvider = new JsonRpcProvider('https://chain-rpc.litprotocol.com/http');

export const chronicleSigner = new Wallet(process.env.SIGNER_KEY || '', chronicleProvider);
