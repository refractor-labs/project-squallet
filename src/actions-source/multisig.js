import {
  hashUnsignedTransaction,
  serializeUnsignedTransaction,
  validAddress,
  verifySignature
} from '../lib/action/lit-lib'

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

const go = async () => {
  const input = { request, method }
  if (input.method === 'signMessage') {
    const sigShare = await LitActions.ethPersonalSignMessageEcdsa({ message, publicKey, sigName })
  } else if (input.method === 'signTransaction') {
    //transaction should have gas parameters in it.
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

    const sigShare = await LitActions.signEcdsa({
      toSign: serializeUnsignedTransaction(transaction),
      publicKey,
      sigName
    })

    return successResponse(transaction)
  } else {
    console.log('Invalid method', input.method)
    return errorResponse('Invalid method')
  }

  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
}

go()
