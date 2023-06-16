/**
 * NAME: multisig
 */

import {
  arrayifyUnsignedTransaction,
  equivalent,
  hashUnsignedTransaction,
  SignMessageRequest,
  SignTransactionRequest,
  SignTypedDataRequest,
  validAddress,
  verifySignature,
  verifyTypedDataSignature,
} from "@refactor-labs-lit-protocol/litlib";

const authorizedAddresses = ["%%OWNER_ADDRESS%%"];
const threshold = 11337012321;

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

const allowedMethods: string[] = [
  "signMessage",
  "signTransaction",
  "signTypedData",
];

const governanceForMethod = {
  signMessage: (input: SignMessageRequest) => {
    const {
      request: { message, signatures },
      method,
    } = input;
    //todo
    //sign typed data metamask
    //https://github.com/MetaMask/eth-sig-util/blob/fb40290810a443df2ae137b3de554f782fff79f9/src/sign-typed-data.ts#L538
  },
  signTypedData: (input: SignTypedDataRequest) => {
    const {
      request: { domain, types, value, signatures },
      method,
    } = input;
    if (signatures.length < threshold) {
      return errorResponse("Not enough signatures");
    }
    const authorizedAddressesCopy = [...authorizedAddresses];
    for (let signature of signatures) {
      if (!validAddress(signature.signerAddress)) {
        return errorResponse("adddress not checksummed");
      }
      if (authorizedAddressesCopy.includes(signature.signerAddress)) {
        authorizedAddressesCopy.splice(
          authorizedAddressesCopy.indexOf(signature.signerAddress),
          1
        );
      } else {
        return errorResponse(
          "address not authorized: " + signature.signerAddress
        );
      }
    }
    for (let i = 0; i < signatures.length && i < threshold; i++) {
      const { signerAddress, signature } = signatures[i];
      console.log("signerAddress", signerAddress, "signature", signature);
      const recoveredAddress = verifyTypedDataSignature(
        domain,
        types,
        value,
        signature
      );
      console.log(
        "recoveredAddress",
        recoveredAddress,
        "expected",
        signerAddress
      );

      if (recoveredAddress !== signerAddress) {
        console.log("Failed to verify signature!");
        return errorResponse("invalid signature");
      }
    }
    return true;

    //todo
    //sign typed data metamask
    //https://github.com/MetaMask/eth-sig-util/blob/fb40290810a443df2ae137b3de554f782fff79f9/src/sign-typed-data.ts#L538
  },
  signTransaction: (input: SignTransactionRequest) => {
    const { request, method } = input;
    const { signedTransaction, transaction } = request;

    if (signedTransaction.signatures.length < threshold) {
      return errorResponse("Not enough signatures");
    }

    console.log("signedTransaction", JSON.stringify(signedTransaction));
    console.log("transaction", JSON.stringify(transaction));

    const authorizedAddressesCopy = [...authorizedAddresses];
    for (let signature of signedTransaction.signatures) {
      if (!validAddress(signature.signerAddress)) {
        return errorResponse("adddress not checksummed");
      }
      if (authorizedAddressesCopy.includes(signature.signerAddress)) {
        authorizedAddressesCopy.splice(
          authorizedAddressesCopy.indexOf(signature.signerAddress),
          1
        );
      } else {
        return errorResponse(
          "address not authorized: " + signature.signerAddress
        );
      }
    }
    //verify the signed transaction is equal to the transaction
    if (!equivalent(signedTransaction, transaction)) {
      return errorResponse("transactions not equal");
    }
    const rawMessage = hashUnsignedTransaction(signedTransaction.transaction);
    console.log("hashToSign", rawMessage);
    //todo use sign typed data

    for (
      let i = 0;
      i < signedTransaction.signatures.length && i < threshold;
      i++
    ) {
      const { signerAddress, signature } = signedTransaction.signatures[i];
      console.log("signerAddress", signerAddress, "signature", signature);
      const recoveredAddress = verifySignature(
        signedTransaction.transaction,
        signature
      );
      console.log(
        "recoveredAddress",
        recoveredAddress,
        "expected",
        signerAddress
      );

      if (recoveredAddress !== signerAddress) {
        console.log("Failed to verify signature!");
        return errorResponse("invalid signature");
      }
    }
    return true;
  },
};

const go = async () => {
  const input = { request, method, sigName, publicKey };
  if (!allowedMethods.includes(input.method)) {
    console.log("Invalid method", input.method);
    return errorResponse("Invalid method");
  }
  // @ts-ignore
  const ok = governanceForMethod[input.method](input);
  if (!ok) {
    return;
  }

  if (input.method === "signMessage") {
    // todo support typed data eip712 as well as plain sign message
    const message = request.message;
    const sigShare = await LitActions.ethPersonalSignMessageEcdsa({
      message,
      publicKey,
      sigName,
    });
    return successResponse(message);
  } else if (input.method === "signTransaction") {
    //transaction should have gas parameters in it.
    const { signedTransaction, transaction } = input.request;
    const sigShare = await LitActions.signEcdsa({
      toSign: arrayifyUnsignedTransaction(transaction),
      publicKey,
      sigName,
    });

    return successResponse(transaction);
  }
};

go();
