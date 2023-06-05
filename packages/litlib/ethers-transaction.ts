import { SignatureLike } from "@ethersproject/bytes";
import { ethers, providers, TypedDataDomain } from "ethers";
import {
  TransactionModel,
  TransactionRequest,
  TransactionRequestI,
  UnsignedMpcTransaction,
} from "./transaction.types";
import { TypedDataField } from "@ethersproject/abstract-signer";

/**
 * Sign a standard transaction. Ignoring gas price and priority. Forces 1559 txns.
 * @param tx {UnsignedMpcTransaction}
 */
export const hashUnsignedTransaction = (tx: UnsignedMpcTransaction) => {
  return ethers.utils.hashMessage(serializeUnsignedTransaction(tx));
};
/**
 * verify the model and equal to the transaction
 * @param signedTransaction
 * @param transaction
 */
export const equivalent = (
  signedTransaction: TransactionModel,
  transaction: TransactionRequestI
) => {
  //transaction is the one that was signed by the owner and will be broadcast
  return (
    serializeUnsignedTransaction(signedTransaction.transaction) ===
    ethers.utils.serializeTransaction(TransactionRequest.from(transaction))
  );
};

/**
 * Serialize a standard transaction for signing. Ignoring gas price and priority. Forces 1559 txns.
 * @param tx {UnsignedMpcTransaction}
 */
export const serializeUnsignedTransaction = (tx: UnsignedMpcTransaction) => {
  //copy it over so we know the properties
  // skip gas price and priority
  const txCopy = {
    chainId: tx.chainId,
    nonce: tx.nonce,
    type: 2,
    maxPriorityFeePerGas: 0,
    maxFeePerGas: 0,
    gasLimit: tx.gasLimit,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    data: tx.data,
    accessList: tx.accessList,
  };
  return ethers.utils.serializeTransaction(txCopy);
};

export const arrayifyUnsignedTransaction = (tx: UnsignedMpcTransaction) => {
  return ethers.utils.arrayify(serializeUnsignedTransaction(tx));
};

export const verifySignature = (
  transaction: UnsignedMpcTransaction,
  signature: SignatureLike
) => {
  const rawMessage = hashUnsignedTransaction(transaction);
  const message = ethers.utils.toUtf8Bytes(rawMessage);
  return ethers.utils.verifyMessage(message, signature);
};

export const verifyTypedDataSignature = (
  domain: TypedDataDomain,
  types: Record<string, TypedDataField[]>,
  value: Record<string, any>,
  signature: SignatureLike
) => {
  return ethers.utils.verifyTypedData(domain, types, value, signature);
};

export const validAddress = (address: string) => {
  try {
    return ethers.utils.getAddress(address) === address;
  } catch (e) {
    return false;
  }
};
