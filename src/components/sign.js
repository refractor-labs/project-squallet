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
import {useState} from 'react';

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

const litActionCode2 = `
const go = async () => {  
  console.log("hello world");
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (message, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await Lit.Actions.ethPersonalSignMessageEcdsa({ message, publicKey , sigName });
};

go();
`;

function Sign() {

  const [publicKey, setPublicKey] = useState("");
  const [pkpId, setPkpId] = useState("");
    const [address, setAddress] = useState("");

  const mintPkp = async () => {
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
      const pkpId= tokenId;
      console.log("tokenId", tokenId);
      console.log("pkpId", pkpId);
      setPkpId(pkpId)

      // extract public key and address
      const publicKey = await litContracts.pkpNftContract.read.getPubkey(tokenId);
      setPublicKey(publicKey)
      console.log("publicKey", publicKey);
      console.log("address", ethers.computeAddress(publicKey));
      setAddress(ethers.computeAddress(publicKey))



    } catch (err) {
      console.log(err)
    }
  };

  const executeLitAction = async (codeString) => {
    const litContracts = new LitContracts();
    await litContracts.connect();
    const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
    await litNodeClient.connect();

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
  }

  const executeLitAction1 = async () => {
    executeLitAction(litActionCode)
  }

  const executeLitAction2 = async () => {
    litActionCode(litActionCode2)
  }

  const checkPermissions = async () => {
    //
    const litContracts = new LitContracts();
    await litContracts.connect();
    const permittedAddresses = await litContracts.pkpPermissionsContractUtil.read.getPermittedAddresses(pkpId)
    console.log("permittedAddresses",permittedAddresses)

  }


  const addPermittedAddress = async () => {

    const litContracts = new LitContracts();
    await litContracts.connect();
    const permittedAddresses = await litContracts.pkpPermissionsContractUtil.write.addPermittedAddress(pkpId, '0x2b34DF494de577E1c108cB174bff7639D9f3CbA0')
    console.log("permittedAddresses",permittedAddresses)

  }



  return (
    <div className="App">
      <button onClick={mintPkp}>Mint PKP</button>

      <div>Public key: {publicKey}</div>
      <div>PKP Address: {address}</div>
      <div>PKP ID: {pkpId}</div>
      <button onClick={executeLitAction1}>Execute Action1</button>
      <button onClick={checkPermissions}>Check Permissions</button>
      <button onClick={addPermittedAddress}>Add Permitted Address</button>
      <button onClick={executeLitAction2}>Execute Action2</button>
      <hr />
      <button onClick={() => window.location.reload()}>Reload</button>
    </div>
  );
}

export default Sign;
