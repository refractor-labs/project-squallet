export const litActions = {
  readPermissions: `
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
const go = async () => {
  const results = {}
  const tokenId = Lit.Actions.pubkeyToTokenId({ publicKey })
  results.tokenId = tokenId
  // let's lookup some permissions
  const isPermittedAction = await Lit.Actions.isPermittedAction({
    tokenId,
    ipfsId: 'QmRwN9GKHvCn4Vk7biqtr6adjXMs7PzzYPCzNCRjPFiDjm'
  })
  results.isPermittedAction = isPermittedAction
  const isPermittedAddress = await Lit.Actions.isPermittedAddress({
    tokenId,
    address: Lit.Auth.authSigAddress
  })
  results.isPermittedAddress = isPermittedAddress
  const userId = uint8arrayFromString('testing', 'utf8')
  const isPermittedAuthMethod = await Lit.Actions.isPermittedAuthMethod({
    tokenId,
    authMethodType: '2',
    userId
  })
  results.isPermittedAuthMethod = isPermittedAuthMethod
  const permittedActions = await Lit.Actions.getPermittedActions({ tokenId })
  results.permittedActions = permittedActions
  const permittedAddresses = await Lit.Actions.getPermittedAddresses({ tokenId })
  results.permittedAddresses = permittedAddresses
  const permittedAuthMethods = await Lit.Actions.getPermittedAuthMethods({ tokenId })
  results.permittedAuthMethods = JSON.stringify(permittedAuthMethods)
  const permittedAuthMethodScopes = await Lit.Actions.getPermittedAuthMethodScopes({
    tokenId,
    authMethodType: '2',
    userId,
    maxScopeId: 10
  })
  results.permittedAuthMethodScopes = JSON.stringify(permittedAuthMethodScopes)
  Lit.Actions.setResponse({ response: JSON.stringify(results) })
}
go()

/******/ })()
;
`,
  multisig: `/******/ (() => { // webpackBootstrap
/******/ \t"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: external "ethers"
const external_ethers_namespaceObject = ethers;
;// CONCATENATED MODULE: ./src/lib/action/lit-lib.js


/**
 * Sign a standard transaction. Ignoring gas price and priority. Forces 1559 txns.
 * @param tx {UnsignedMpcTransaction}
 */
const hashUnsignedTransaction = tx => {
  return external_ethers_namespaceObject.ethers.utils.hashMessage(serializeUnsignedTransaction(tx))
}

/**
 * Serialize a standard transaction for signing. Ignoring gas price and priority. Forces 1559 txns.
 * @param tx {UnsignedMpcTransaction}
 */
const serializeUnsignedTransaction = tx => {
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
    accessList: tx.accessList
  }
  return external_ethers_namespaceObject.ethers.utils.serializeTransaction(txCopy)
}

const verifySignature = (transaction, signature) => {
  const rawMessage = hashUnsignedTransaction(transaction)
  const message = external_ethers_namespaceObject.ethers.utils.toUtf8Bytes(rawMessage)
  return external_ethers_namespaceObject.ethers.utils.verifyMessage(message, signature)
}

;// CONCATENATED MODULE: ./src/actions-source/multisig.js

const go = async () => {
  const input = { request, method }
  if (input.method === 'signMessage') {
    const sigShare = await LitActions.ethPersonalSignMessageEcdsa({ message, publicKey, sigName })
  } else if (input.method === 'signTransaction') {
    //transaction should have gas parameters in it.
    const { signedTransaction, transaction } = request

    const rawMessage = hashUnsignedTransaction(transaction)
    console.log('hashToSign', rawMessage)
    //todo use sign typed data

    const invalidSignature = signedTransaction.signatures.find(({ signerAddress, signature }) => {
      console.log('signerAddress', signerAddress, 'signature', signature)
      const recoveredAddress = verifySignature(transaction, signature)
      console.log('recoveredAddress', recoveredAddress, 'expected', signerAddress)
      return recoveredAddress.toLowerCase() !== signerAddress.toLowerCase()
    })
    if (invalidSignature) {
      console.log('Failed to verify signature!')
      return Lit.Actions.setResponse({
        response: JSON.stringify({ success: false, data: 'invalid signature' })
      })
    }

    const sigShare = await LitActions.signEcdsa({
      toSign: serializeUnsignedTransaction(transaction),
      publicKey,
      sigName
    })

    return Lit.Actions.setResponse({
      response: JSON.stringify({ success: true, data: sigShare })
    })
  } else {
    throw new Error('Invalid method')
  }

  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
}

go()

/******/ })()
;`
}
