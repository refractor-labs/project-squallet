"use strict";
(() => {
  // global-externals:ethers
  var ethers_default = ethers;

  // ../litlib/transaction.types.ts
  var TransactionRequest = class {
    constructor(input) {
      this.to = input.to;
      this.from = input.from;
      this.nonce = input.nonce;
      this.gasLimit = input.gasLimit;
      this.gasPrice = input.gasPrice;
      this.data = input.data;
      this.value = input.value;
      this.chainId = input.chainId;
      this.type = input.type;
      this.accessList = input.accessList;
      this.maxPriorityFeePerGas = input.maxPriorityFeePerGas;
      this.maxFeePerGas = input.maxFeePerGas;
    }
    static from(input) {
      return new TransactionRequest(input);
    }
  };

  // ../litlib/ethers-transaction.ts
  var hashUnsignedTransaction = (tx) => {
    return ethers_default.utils.hashMessage(serializeUnsignedTransaction(tx));
  };
  var equivalent = (signedTransaction, transaction) => {
    return serializeUnsignedTransaction(signedTransaction.transaction) === ethers_default.utils.serializeTransaction(TransactionRequest.from(transaction));
  };
  var serializeUnsignedTransaction = (tx) => {
    const txCopy = {
      chainId: tx.chainId,
      nonce: tx.nonce,
      type: 2,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
      //todo fix these
      maxFeePerGas: tx.maxFeePerGas,
      gasLimit: tx.gasLimit,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      data: tx.data,
      accessList: tx.accessList
    };
    return ethers_default.utils.serializeTransaction(txCopy);
  };
  var arrayifyUnsignedTransaction = (tx) => {
    return ethers_default.utils.arrayify(serializeUnsignedTransaction(tx));
  };
  var verifySignature = (transaction, signature) => {
    const rawMessage = hashUnsignedTransaction(transaction);
    const message = ethers_default.utils.toUtf8Bytes(rawMessage);
    return ethers_default.utils.verifyMessage(message, signature);
  };
  var verifyTypedDataSignature = (domain, types, value, signature) => {
    return ethers_default.utils.verifyTypedData(domain, types, value, signature);
  };
  var validAddress = (address) => {
    try {
      return ethers_default.utils.getAddress(address) === address;
    } catch (e) {
      return false;
    }
  };

  // lit_actions/src/multisig.action.ts
  var authorizedAddresses = ["%%OWNER_ADDRESS%%"];
  var threshold = 1337;
  var setResponse = (response) => {
    return LitActions.setResponse({
      response: JSON.stringify(response)
    });
  };
  var errorResponse = (message) => {
    return setResponse({ success: false, data: message });
  };
  var successResponse = (message) => {
    return setResponse({ success: true, data: message });
  };
  var allowedMethods = [
    "signMessage",
    "signTransaction",
    "signTypedData"
  ];
  var governanceForMethod = {
    signMessage: (input) => {
      const {
        request: { message, signatures },
        method: method2
      } = input;
    },
    signTypedData: (input) => {
      const {
        request: { domain, types, value, signatures },
        method: method2
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
    },
    signTransaction: (input) => {
      const { request: request2, method: method2 } = input;
      const { signedTransaction, transaction } = request2;
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
      if (!equivalent(signedTransaction, transaction)) {
        return errorResponse("transactions not equal");
      }
      const rawMessage = hashUnsignedTransaction(signedTransaction.transaction);
      console.log("hashToSign", rawMessage);
      for (let i = 0; i < signedTransaction.signatures.length && i < threshold; i++) {
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
    }
  };
  var go = async () => {
    const input = { request, method, sigName, publicKey };
    if (!allowedMethods.includes(input.method)) {
      console.log("Invalid method", input.method);
      return errorResponse("Invalid method");
    }
    const ok = governanceForMethod[input.method](input);
    if (!ok) {
      return;
    }
    if (input.method === "signMessage") {
      const message = request.message;
      const sigShare = await LitActions.ethPersonalSignMessageEcdsa({
        message,
        publicKey,
        sigName
      });
      return successResponse(message);
    } else if (input.method === "signTransaction") {
      const { signedTransaction, transaction } = input.request;
      const sigShare = await LitActions.signEcdsa({
        toSign: arrayifyUnsignedTransaction(transaction),
        publicKey,
        sigName
      });
      return successResponse(transaction);
    }
  };
  go();
})();
