import { SignatureLike, arrayify } from "@ethersproject/bytes";
import {
  TransactionModel,
  TransactionRequest,
  TransactionRequestI,
  UnsignedMpcTransaction,
} from "./transaction.types";
import {
  TypedDataDomain,
  TypedDataField,
} from "@ethersproject/abstract-signer";
import { serialize } from "@ethersproject/transactions";
import { hashMessage } from "@ethersproject/hash";
import { getAddress } from "@ethersproject/address";
import { verifyTypedData, verifyMessage } from "@ethersproject/wallet";
import { toUtf8Bytes } from "@ethersproject/strings";

/**
 * Sign a standard transaction. Ignoring gas price and priority. Forces 1559 txns.
 * @param tx {UnsignedMpcTransaction}
 */
export const hashUnsignedTransaction = (tx: UnsignedMpcTransaction) => {
  return hashMessage(serializeUnsignedTransaction(tx));
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
    serialize(signedTransaction.transaction) ===
    serialize(TransactionRequest.from(transaction))
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
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas, //todo fix these
    maxFeePerGas: tx.maxFeePerGas,
    gasLimit: tx.gasLimit,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    data: tx.data,
    accessList: tx.accessList,
  };
  return serialize(txCopy);
  // return ethers.utils.serializeTransaction(txCopy);
};

export const arrayifyUnsignedTransaction = (tx: UnsignedMpcTransaction) => {
  return arrayify(serializeUnsignedTransaction(tx));
};

export const verifySignature = (
  transaction: UnsignedMpcTransaction,
  signature: SignatureLike
) => {
  const rawMessage = hashUnsignedTransaction(transaction);
  const message = toUtf8Bytes(rawMessage);
  return verifyMessage(message, signature);
};

export const verifyTypedDataSignature = (
  domain: TypedDataDomain,
  types: Record<string, TypedDataField[]>,
  value: Record<string, any>,
  signature: SignatureLike
) => {
  return verifyTypedData(domain, types, value, signature);
};

export const validAddress = (address: string) => {
  try {
    return getAddress(address) === address;
  } catch (e) {
    return false;
  }
};
