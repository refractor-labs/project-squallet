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

const validAddress = address => {
  try {
    return external_ethers_namespaceObject.ethers.utils.getAddress(address) === address
  } catch (e) {
    return false
  }
}

;// CONCATENATED MODULE: ./src/actions-source/multisig.js


const authorizedAddresses = ['0x182351E16c1F511e50eA4438aFE3d0f16ae4769B']
const threshold = 1

const setResponse = response => {
  return Lit.Actions.setResponse({
    response: JSON.stringify(response)
  })
}
const errorResponse = message => {
  return setResponse({ success: false, data: message })
}
const successResponse = message => {
  return setResponse({ success: true, data: message })
}

const allowedMethods = ['signMessage', 'signTransaction']

const governanceForMethod = {
  signMessage: input => {
    const {
      request: { message, signatures },
      method
    } = input
    //todo
  },
  signTransaction: input => {
    const { request, method } = input
    const { signedTransaction, transaction } = request

    if (signedTransaction.signatures.length < threshold) {
      return errorResponse('Not enough signatures')
    }

    const authorizedAddressesCopy = [...authorizedAddresses]
    for (let signature of signedTransaction.signatures) {
      if (!validAddress(signature.signerAddress)) {
        return errorResponse('adddress not checksummed')
      }
      if (authorizedAddressesCopy.includes(signature.signerAddress)) {
        authorizedAddressesCopy.splice(authorizedAddressesCopy.indexOf(signature.signerAddress), 1)
      } else {
        return errorResponse('address not authorized')
      }
    }

    const rawMessage = hashUnsignedTransaction(transaction)
    console.log('hashToSign', rawMessage)
    //todo use sign typed data

    for (let i = 0; i < signedTransaction.signatures.length && i < threshold; i++) {
      const { signerAddress, signature } = signedTransaction.signatures[i]
      console.log('signerAddress', signerAddress, 'signature', signature)
      const recoveredAddress = verifySignature(transaction, signature)
      console.log('recoveredAddress', recoveredAddress, 'expected', signerAddress)

      if (recoveredAddress !== signerAddress) {
        console.log('Failed to verify signature!')
        return errorResponse('invalid signature')
      }
    }
    return true
  }
}

const go = async () => {
  const input = { request, method, sigName, publicKey }
  if (!allowedMethods.includes(input.method)) {
    console.log('Invalid method', input.method)
    return errorResponse('Invalid method')
  }
  const ok = governanceForMethod[input.method](input)
  if (!ok) {
    return
  }

  if (input.method === 'signMessage') {
    // todo support typed data eip712 as well as plain sign message
    const message = request.message
    const sigShare = await LitActions.ethPersonalSignMessageEcdsa({ message, publicKey, sigName })
    return successResponse(message)
  } else if (input.method === 'signTransaction') {
    //transaction should have gas parameters in it.
    const { signedTransaction, transaction } = input.request
    const sigShare = await LitActions.signEcdsa({
      toSign: serializeUnsignedTransaction(transaction),
      publicKey,
      sigName
    })

    return successResponse(transaction)
  }
}

go()

/******/ })()
;`
}
