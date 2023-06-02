import { SignatureLike } from "@ethersproject/bytes";
import { ethers } from "ethers";
import { UnsignedMpcTransaction } from "./transaction.types";

/**
 * Sign a standard transaction. Ignoring gas price and priority. Forces 1559 txns.
 * @param tx {UnsignedMpcTransaction}
 */
export const hashUnsignedTransaction = (tx: UnsignedMpcTransaction) => {
  return ethers.utils.hashMessage(serializeUnsignedTransaction(tx));
};

/**
 * Serialize a standard transaction for signing. Ignoring gas price and priority. Forces 1559 txns.
 * @param tx {UnsignedMpcTransaction}
 */
export const serializeUnsignedTransaction = (tx: UnsignedMpcTransaction) => {
  //copy it over so we know the properties
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
  return ethers.utils.arrayify(ethers.utils.serializeTransaction(txCopy));
};

export const verifySignature = (
  transaction: UnsignedMpcTransaction,
  signature: SignatureLike
) => {
  const rawMessage = hashUnsignedTransaction(transaction);
  const message = ethers.utils.toUtf8Bytes(rawMessage);
  return ethers.utils.verifyMessage(message, signature);
};

export const validAddress = (address: string) => {
  try {
    return ethers.utils.getAddress(address) === address;
  } catch (e) {
    return false;
  }
};
