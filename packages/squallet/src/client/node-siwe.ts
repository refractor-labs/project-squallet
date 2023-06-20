import { Signer } from "@ethersproject/abstract-signer";
import { getAddress } from "@ethersproject/address";
import { SiweMessage } from "lit-siwe";

export interface SignedMessage {
  signature: string;
  address: string;
}
export interface AuthSig {
  sig: any;
  derivedVia: string;
  signedMessage: string;
  address: string;
}
export const nodeSiwe = async (signer: Signer): Promise<AuthSig> => {
  const expiration = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
  const address = getAddress(await signer.getAddress());
  const preparedMessage: Partial<SiweMessage> = {
    domain: "example.com",
    address: address, // convert to EIP-55 format or else SIWE complains
    version: "1",
    chainId: await signer.getChainId(),
    expirationTime: expiration,
    uri: "http://example.com/siwe",
  };

  const message: SiweMessage = new SiweMessage(preparedMessage);
  const body: string = message.prepareMessage();
  let signedResult: SignedMessage = {
    signature: await signer.signMessage(body),
    address,
  };
  // -- 3. prepare auth message
  let authSig: AuthSig = {
    sig: signedResult.signature,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: body,
    address: signedResult.address,
  };
  return authSig;
};
