"use strict";
(() => {
  // ../litlib/src/action/transaction.types.ts
  var TransactionRequest = class _TransactionRequest {
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
      this.maxPriorityFeePerGas = void 0;
      this.maxFeePerGas = void 0;
      this.maxFee = input.maxFee;
    }
    static from(input) {
      return new _TransactionRequest(input);
    }
  };

  // global-externals:ethers
  var ethers_default = ethers;

  // ../litlib/src/action/transaction-request.ts
  function formatNumber(value, name) {
    const result = ethers_default.utils.stripZeros(ethers_default.BigNumber.from(value).toHexString());
    if (result.length > 32) {
      throw new Error("invalid " + name);
    }
    return result;
  }
  function formatAccessList(value) {
    return ethers_default.utils.accessListify(value).map((set) => [set.address, set.storageKeys]);
  }
  var serializeTransactionRequest = (tx) => {
    const transaction = TransactionRequest.from(tx);
    const fields = [
      formatNumber(transaction.chainId || 0, "chainId"),
      formatNumber(transaction.nonce || 0, "nonce"),
      formatNumber(transaction.maxFee || 0, "maxFee"),
      formatNumber(transaction.maxPriorityFeePerGas || 0, "maxPriorityFeePerGas"),
      formatNumber(transaction.maxFeePerGas || 0, "maxFeePerGas"),
      formatNumber(transaction.gasLimit || 0, "gasLimit"),
      transaction.to != null ? ethers_default.utils.getAddress(transaction.to) : "0x",
      formatNumber(transaction.value || 0, "value"),
      transaction.data || "0x",
      formatAccessList(transaction.accessList || [])
    ];
    return ethers_default.utils.hexConcat(["0x02", ethers_default.utils.RLP.encode(fields)]);
  };
  var hashTransactionRequest = (tx) => {
    return ethers_default.utils.hashMessage(serializeTransactionRequest(tx));
  };

  // ../litlib/src/action/ethers-transaction.ts
  var serializeUnsignedTransaction = (tx) => {
    return ethers_default.utils.serializeTransaction(copyUnsignedTransaction(tx));
  };
  var copyUnsignedTransaction = (tx) => {
    return {
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
  };
  var arrayifyUnsignedTransaction = (tx) => {
    return ethers_default.utils.arrayify(serializeUnsignedTransaction(tx));
  };
  var verifySignature = (transaction, signature) => {
    const rawMessage = hashTransactionRequest(transaction);
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
  var getFeeOk = (fee, tx) => {
    const txFeeGwei = ethers_default.BigNumber.from(fee.maxFeePerGas).mul(tx.gasLimit);
    console.log("fee.maxFeePerGas", fee.maxFeePerGas.toString());
    console.log("tx.gasLimit", tx.gasLimit.toString());
    console.log("gasGwei", txFeeGwei.toString());
    console.log("tx.maxFee", tx.maxFee.toString());
    return txFeeGwei.lte(ethers_default.BigNumber.from(tx.maxFee));
  };

  // src/multisig.action.ts
  var authorizedAddresses = ["%%OWNER_ADDRESS%%"];
  var threshold = 11337012321;
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
  var allowedMethods = ["signMessage", "signTransaction", "signTypedData"];
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
          return errorResponse("address not checksummed");
        }
        if (authorizedAddressesCopy.includes(signature.signerAddress)) {
          authorizedAddressesCopy.splice(authorizedAddressesCopy.indexOf(signature.signerAddress), 1);
        } else {
          return errorResponse("address not authorized: " + signature.signerAddress);
        }
      }
      for (let i = 0; i < signatures.length && i < threshold; i++) {
        const { signerAddress, signature } = signatures[i];
        console.log("signerAddress", signerAddress, "signature", signature);
        const recoveredAddress = verifyTypedDataSignature(domain, types, value, signature);
        console.log("recoveredAddress", recoveredAddress, "expected", signerAddress);
        if (recoveredAddress !== signerAddress) {
          console.log("Failed to verify signature!");
          return errorResponse("invalid signature");
        }
      }
      return true;
    },
    signTransaction: (input) => {
      const { request: request2, method: method2 } = input;
      const { signedTransaction, fee } = request2;
      if (signedTransaction.signatures.length < threshold) {
        return errorResponse("Not enough signatures");
      }
      console.log("signedTransaction", JSON.stringify(signedTransaction));
      const authorizedAddressesCopy = [...authorizedAddresses];
      for (let signature of signedTransaction.signatures) {
        if (!validAddress(signature.signerAddress)) {
          return errorResponse("address not checksummed");
        }
        if (authorizedAddressesCopy.includes(signature.signerAddress)) {
          authorizedAddressesCopy.splice(authorizedAddressesCopy.indexOf(signature.signerAddress), 1);
        } else {
          return errorResponse("address not authorized: " + signature.signerAddress);
        }
      }
      if (!getFeeOk(fee, signedTransaction.transaction)) {
        return errorResponse("fee too high");
      }
      const rawMessage = hashTransactionRequest(signedTransaction.transaction);
      console.log("hashToSign", rawMessage);
      for (let i = 0; i < signedTransaction.signatures.length && i < threshold; i++) {
        const { signerAddress, signature } = signedTransaction.signatures[i];
        console.log("signerAddress", signerAddress, "signature", signature);
        const recoveredAddress = verifySignature(signedTransaction.transaction, signature);
        console.log("recoveredAddress", recoveredAddress, "expected", signerAddress);
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
      const { signedTransaction, fee } = input.request;
      const unsignedTx = arrayifyUnsignedTransaction({ ...signedTransaction.transaction, ...fee });
      const sigShare = await LitActions.signEcdsa({
        toSign: unsignedTx,
        publicKey,
        sigName
      });
      return successResponse("ok");
    }
  };
  go();
})();
