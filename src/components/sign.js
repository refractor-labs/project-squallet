import LitJsSdk from 'lit-js-sdk'
import { recoverAddress } from '@ethersproject/transactions'
import { splitSignature, joinSignature } from '@ethersproject/bytes'
import { recoverPublicKey, computePublicKey } from '@ethersproject/signing-key'
import { verifyMessage } from '@ethersproject/wallet'
import { LitContracts } from '@lit-protocol/contracts-sdk'
import { ethers } from 'ethers'
import { useState } from 'react'
import { litActions } from '@/components/lit-actions-code'
import { hashUnsignedTransaction } from '@/lib/action/lit-lib'

// this code will be run on the node
const litActionCode = `
const go = async () => {  
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (message, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await Lit.Actions.ethPersonalSignMessageEcdsa({ message, publicKey , sigName });
};

go();
`

const litActionCode2 = `
const go = async () => {  
  console.log("hello world");
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (message, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await Lit.Actions.ethPersonalSignMessageEcdsa({ message, publicKey , sigName });
};

go();
`

function Sign() {
  const [publicKey, setPublicKey] = useState('')
  const [pkpId, setPkpId] = useState('')
  const [address, setAddress] = useState('')

  const mintPkp = async () => {
    try {
      // logout so we can do the full flow everytime (not required in production)
      await LitJsSdk.disconnectWeb3()

      // initialization
      const litContracts = new LitContracts()
      await litContracts.connect()
      const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: 'serrano' })
      await litNodeClient.connect()

      // mint token
      const mintCost = await litContracts.pkpNftContract.read.mintCost()
      const tx = await litContracts.pkpNftContract.write.mintNext(2, { value: mintCost })
      const txResp = await tx.wait()

      // this token id belongs to the metamask that minted it
      const tokenId = txResp.events[1].topics[3]
      const pkpId = tokenId
      console.log('tokenId', tokenId)
      console.log('pkpId', pkpId)
      setPkpId(pkpId)

      // extract public key and address
      const publicKey = await litContracts.pkpNftContract.read.getPubkey(tokenId)
      setPublicKey(publicKey)
      console.log('publicKey', publicKey)
      console.log('address', ethers.utils.computeAddress(publicKey))
      setAddress(ethers.utils.computeAddress(publicKey))
    } catch (err) {
      console.log(err)
    }
  }

  const executeLitAction = async (message, codeString) => {
    const litContracts = new LitContracts()
    await litContracts.connect()
    const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: 'serrano' })
    await litNodeClient.connect()

    // get authentication signature to deploy call the action
    var authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: 'mumbai'
    })

    // this does both deployment action calling in the same code
    // need to break it down to upload to ipfs separately
    const resp = await litNodeClient.executeJs({
      code: codeString,
      authSig,
      // all jsParams can be used anywhere in your litActionCode
      jsParams: {
        message,
        publicKey,
        sigName: 'sig1'
      }
    })
    console.log(resp)
    return resp
  }
  const executeLitActionAndVerify = async codeString => {
    const message = 'Hello'
    const resp = await executeLitAction(message, codeString)
    console.log('resp', resp)
    const sig = resp.signatures.sig1
    const dataSigned = sig.dataSigned
    const encodedSig = joinSignature({
      r: '0x' + sig.r,
      s: '0x' + sig.s,
      v: sig.recid
    })

    // validations
    console.log('encodedSig', encodedSig)
    console.log('sig length in bytes: ', encodedSig.substring(2).length / 2)
    console.log('dataSigned', dataSigned)
    const splitSig = splitSignature(encodedSig)
    console.log('splitSig', splitSig)

    const recoveredPubkey = recoverPublicKey(dataSigned, encodedSig)
    console.log('uncompressed recoveredPubkey', recoveredPubkey)
    const compressedRecoveredPubkey = computePublicKey(recoveredPubkey, true)
    console.log('compressed recoveredPubkey', compressedRecoveredPubkey)
    const recoveredAddress = recoverAddress(dataSigned, encodedSig)
    console.log('recoveredAddress', recoveredAddress)

    const recoveredAddressViaMessage = verifyMessage(message, encodedSig)
    console.log('recoveredAddressViaMessage', recoveredAddressViaMessage)
  }

  const executeLitAction1 = async () => {
    await executeLitActionAndVerify(litActionCode)
  }

  const executeLitAction2 = async () => {
    await executeLitActionAndVerify(litActionCode2)
  }

  const checkPermissions = async () => {
    //
    const litContracts = new LitContracts()
    await litContracts.connect()
    const permittedAddresses =
      await litContracts.pkpPermissionsContractUtil.read.getPermittedAddresses(pkpId)
    console.log('permittedAddresses', permittedAddresses)
  }

  const addPermittedAddress = async () => {
    const litContracts = new LitContracts()
    await litContracts.connect()
    const permittedAddresses =
      await litContracts.pkpPermissionsContractUtil.write.addPermittedAddress(
        pkpId,
        '0x2b34DF494de577E1c108cB174bff7639D9f3CbA0'
      )
    console.log('permittedAddresses', permittedAddresses)
  }

  const addPermittedActionIpfsCid = async () => {
    const litContracts = new LitContracts()
    await litContracts.connect()
    const permittedAction = await litContracts.pkpPermissionsContractUtil.write.addPermittedAction(
      pkpId,
      // 'QmcJVc1jx1R2M6fedwASWQ53HKY6YddjEE4ZegNWrB9o8M'
      'Qmcv4U9ZmSRddTpY9iz381W5kDWFM5RGB93DTt4aVWceab'
    )
    console.log('permittedAction', permittedAction)
  }

  const addAuthMethod = async () => {
    const litContracts = new LitContracts()
    await litContracts.connect()
    // const permittedAddresses = await litContracts.accessControlConditionsContract.write.
  }
  const executeLitActionIpfs = async (message, cid) => {
    const litContracts = new LitContracts()
    await litContracts.connect()
    const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: 'serrano' })
    await litNodeClient.connect()

    // get authentication signature to deploy call the action
    var authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: 'mumbai'
    })

    // this does both deployment action calling in the same code
    // need to break it down to upload to ipfs separately
    const resp = await litNodeClient.executeJs({
      ipfsId: cid,
      authSig,
      // all jsParams can be used anywhere in your litActionCode
      jsParams: {
        message,
        publicKey,
        sigName: 'sig1'
      }
    })
    console.log(resp)
    return resp
  }

  const executeGetPermissionsIpfs = async () => {
    // await executeLitActionIpfs('Hello', 'QmcJVc1jx1R2M6fedwASWQ53HKY6YddjEE4ZegNWrB9o8M')
    //webpack bundled version
    await executeLitActionIpfs('Hello', 'Qmcv4U9ZmSRddTpY9iz381W5kDWFM5RGB93DTt4aVWceab')
  }
  const executeGetPermissionsAction = async () => {
    await executeLitAction('hello', litActions.readPermissions)
  }

  const executeMultisig = async () => {
    await executeLitAction('hello', litActions.readPermissions)
  }
  const testSignature = async () => {
    const signature =
      '0x25f9cdefc0f6149d32189542eb428a9662fdc6c15552a0c1772b7b7d85ad3fc5182d39865f16c4e9807ec163fbdb37642c3c4dd278c61aed1343a2fdc93532811c'
    const rawHashExpected = '0x38d5322d8c2daaebe346724b5bb458211fd7a71c8a961d7f803edcb7a6edae84'
    const transaction = {
      nonce: 0,
      type: 2,
      maxFeePerGas: 0,
      maxPriorityFeePerGas: 0,
      from: '0xf34Ee198872E5805b2BE9b8F6dE49f72376a1B6D',
      to: '0xf34Ee198872E5805b2BE9b8F6dE49f72376a1B6D',
      value: '0x00',
      data: '0x',
      chainId: 0,
      gasLimit: '0x5208'
    }
    const rawMessage = hashUnsignedTransaction(transaction)
    console.log('rawMessage', rawMessage, 'expected', rawHashExpected)
    const rawMessageLength = new Blob([rawMessage]).size
    console.log('hashToSign', rawMessage)
    //todo use sign typed data
    let message = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes('\x19Ethereum Signed Message:\n' + rawMessageLength + rawMessage)
    )

    message = ethers.utils.toUtf8Bytes(rawMessage)

    const signerAddress = '0x182351E16c1F511e50eA4438aFE3d0f16ae4769B'
    const recoveredAddress = ethers.utils.verifyMessage(message, signature)
    console.log('signerAddress', signerAddress, 'signature', signature)
    console.log('recoveredAddress', recoveredAddress, 'expected', signerAddress)
    console.log('equivalent', recoveredAddress.toLowerCase() === signerAddress.toLowerCase())
  }

  return (
    <div className="App">
      <button onClick={mintPkp}>Mint PKP</button>
      <div>Public key: {publicKey}</div>
      <div>PKP Address: {address}</div>
      <div>PKP ID: {pkpId}</div>
      <button onClick={executeLitAction1}>Execute Action1</button>
      <button onClick={checkPermissions}>Check Permissions</button>
      <button onClick={addPermittedAddress}>Add Permitted Address</button>
      <button onClick={executeLitAction2}>Execute Action2</button>
      <button onClick={executeGetPermissionsAction}>Execute Read Permissions</button>
      <button onClick={addPermittedActionIpfsCid}>Add permitted action</button>
      <button onClick={executeGetPermissionsIpfs}>Execute IPFS Action</button>
      <button onClick={testSignature}>Test Signature</button>
      <hr />
      <br />
      Public key: <input id={'pubkey-in'} type={'text'} />
      PKP Address: <input id={'pkpaddress-in'} type={'text'} />
      PKP ID: <input id={'pkpid-in'} type={'text'} />
      <button
        onClick={() => {
          setPublicKey(document.getElementById('pubkey-in').value)
          setAddress(document.getElementById('pkpaddress-in').value)
          setPkpId(document.getElementById('pkpid-in').value)
        }}
      >
        Input Values
      </button>
      <hr />
      <br />
      <button onClick={() => window.location.reload()}>Reload</button>
    </div>
  )
}

export default Sign
