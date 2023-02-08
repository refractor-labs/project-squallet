import LitJsSdk from "lit-js-sdk";
import { recoverAddress } from "@ethersproject/transactions";
import {
  splitSignature,
  joinSignature,
} from "@ethersproject/bytes";
import { recoverPublicKey, computePublicKey } from "@ethersproject/signing-key";
import { verifyMessage } from "@ethersproject/wallet";
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from "ethers";

// this code will be run on the node
const litActionCode = `
const go = async () => {  
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (message, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await Lit.Actions.ethPersonalSignMessageEcdsa({ message, publicKey , sigName });
};

go();
`;

function Sign() {

  const runLitAction = async () => {
    try {
      // logout so we can do the full flow everytime (not required in production)
      await LitJsSdk.disconnectWeb3();
      
      // initialization
      const litContracts = new LitContracts();
      await litContracts.connect();
      const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
      await litNodeClient.connect();


      // mint token
      const mintCost = await litContracts.pkpNftContract.read.mintCost();
      const tx = await litContracts.pkpNftContract.write.mintNext(2, { value: mintCost });
      const txResp = await tx.wait();

      // this token id belongs to the metamask that minted it
      const tokenId = txResp.events[1].topics[3];
      console.log("tokenId", tokenId);

      // extract public key and address
      const publicKey = await litContracts.pkpNftContract.read.getPubkey(tokenId);
      console.log("publicKey", publicKey);
      console.log("address", ethers.computeAddress(publicKey));

      // get authentication signature to deploy call the action
      var authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: "mumbai",
      });

      // this does both deployment action calling in the same code
      // need to break it down to upload to ipfs separately
      const message = "Hello";
      const resp = await litNodeClient.executeJs({
        code: litActionCode,
        authSig,
        // all jsParams can be used anywhere in your litActionCode
        jsParams: {
          message,
          publicKey,
          sigName: "sig1",
        },
      });
      console.log(resp)
      const sig = resp.signatures.sig1;
      const dataSigned = sig.dataSigned;
      const encodedSig = joinSignature({
        r: "0x" + sig.r,
        s: "0x" + sig.s,
        v: sig.recid,
      });

      // validations
      console.log("encodedSig", encodedSig);
      console.log("sig length in bytes: ", encodedSig.substring(2).length / 2);
      console.log("dataSigned", dataSigned);
      const splitSig = splitSignature(encodedSig);
      console.log("splitSig", splitSig);

      const recoveredPubkey = recoverPublicKey(dataSigned, encodedSig);
      console.log("uncompressed recoveredPubkey", recoveredPubkey);
      const compressedRecoveredPubkey = computePublicKey(recoveredPubkey, true);
      console.log("compressed recoveredPubkey", compressedRecoveredPubkey);
      const recoveredAddress = recoverAddress(dataSigned, encodedSig);
      console.log("recoveredAddress", recoveredAddress);

      const recoveredAddressViaMessage = verifyMessage(message, encodedSig);
      console.log("recoveredAddressViaMessage", recoveredAddressViaMessage);  
    } catch (err) {
      console.log(err)
    }
  };

  return (
    <div className="App">
      <button onClick={runLitAction}>Run Lit Actions</button>
    </div>
  );
}

export default Sign;
