import { BrowserProvider } from "ethers";
import { SiweMessage } from "siwe";

export async function generateAuthSig() {
  const provider = new BrowserProvider((window as any).ethereum, "any");

  const signer = await provider.getSigner();
  const chainId = 1;
  const uri = "https://localhost/login";
  const version = "1";
  // const siweMessage = new SiweMessage({
  //   domain: "localhost",
  //   address: await signer.getAddress(),
  //   statement: "hello! Sign for the weather response API project",
  //   uri,
  //   version,
  //   chainId,
  // });
  const messageToSign = 'test'//siweMessage.prepareMessage();
  const sig = await signer.signMessage(messageToSign);
  return {
    sig,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: messageToSign,
    address: await signer.getAddress(),
  };
}
