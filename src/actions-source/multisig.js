import {
  hashUnsignedTransaction,
  serializeUnsignedTransaction,
  verifySignature
} from '../lib/action/lit-lib'
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
