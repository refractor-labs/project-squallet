/**
 * NAME: multisig
 */

import {
  hashUnsignedTransaction,
  serializeUnsignedTransaction,
  SignTransactionRequest,
  validAddress,
  verifySignature,
} from "@refactor-labs-lit-protocol/litlib";

const authorizedAddresses = ["0x182351E16c1F511e50eA4438aFE3d0f16ae4769B"];
const threshold = 1;

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

const allowedMethods: string[] = ["signMessage", "signTransaction"];

const governanceForMethod = {
  signMessage: (input: any) => {
    const {
      request: { message, signatures },
      method,
    } = input;
    //todo
  },
  signTransaction: (input: SignTransactionRequest) => {
    const { request, method } = input;
    const { signedTransaction, transaction } = request;

    if (signedTransaction.signatures.length < threshold) {
      return errorResponse("Not enough signatures");
    }

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
        return errorResponse("address not authorized");
      }
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
      toSign: serializeUnsignedTransaction(transaction),
      publicKey,
      sigName,
    });

    return successResponse(transaction);
  }
};

go();
