import LitJsSdk from 'lit-js-sdk'
import { recoverAddress } from '@ethersproject/transactions'
import { splitSignature, joinSignature } from '@ethersproject/bytes'
import { recoverPublicKey, computePublicKey } from '@ethersproject/signing-key'
import { verifyMessage } from '@ethersproject/wallet'
import { LitContracts } from '@lit-protocol/contracts-sdk'
import { ethers } from 'ethers'
import { litActions } from '@/components/lit-actions-code'
import { hashUnsignedTransaction } from '@/lib/action/lit-lib'
import erc20 from '@/abis/erc20'
import { ipfs } from '@/utils/ipfs'
import { useLocalStorage } from 'usehooks-ts'

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

const litActionCode3 = `
const go = async () => {  
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (tx, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await Lit.Actions.signEcdsa({ 
    toSign: tx, 
    publicKey, 
    sigName 
  });
};

go();
`

function Sign() {
  const [publicKey] = useLocalStorage('publicKey', '')
  const [pkpId] = useLocalStorage('pkpId', '')
  const [address] = useLocalStorage('address', '')
  const [cid, setCid] = useLocalStorage('cid', '')

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

  const transferErc20 = async () => {
    try {
      const from = address
      const chainId = 80001
      const provider = new ethers.providers.JsonRpcProvider(
        'https://polygon-mumbai.infura.io/v3/e612f847d6854db2807f1f403d9e2464',
        chainId
      )

      const wallet = new ethers.Wallet(
        '47213c56ad7e8164b8dec77b4d6703fc5938c028057b3f3418b026c50359f64b',
        provider
      )

      const contractWithWallet = new ethers.Contract(
        '0x2d7882beDcbfDDce29Ba99965dd3cdF7fcB10A1e',
        erc20,
        wallet
      )
      const contract = new ethers.Contract(
        '0x2d7882beDcbfDDce29Ba99965dd3cdF7fcB10A1e',
        erc20,
        provider
      )

      const litContracts = new LitContracts()
      await litContracts.connect()
      const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: 'serrano' })
      await litNodeClient.connect()

      // console.log("Sending tokens to PKP")
      // const tokensTx = await contractWithWallet.transfer(address, '1');
      // console.log(await tokensTx.wait())
      // console.log(`Tokens sent to ${address}`);

      // console.log("Sending gas to PKP")
      // const gasTx = await wallet.sendTransaction({
      //   to: address,
      //   value: '1000000000000000',
      // });
      // console.log(await gasTx.wait())
      // console.log(`Gas sent to ${address}`);

      const addTx = await litContracts.pkpPermissionsContractUtil.write.addPermittedAction(
        pkpId,
        cid
      )
      console.log(addTx)
      console.log(await addTx.wait())

      console.log('adding permitted address')
      await (
        await litContracts.pkpPermissionsContractUtil.write.addPermittedAddress(
          pkpId,
          '0xb81798b54005170F23f08351F4C26C4e736e26C0'
        )
      ).wait()
      console.log('added permitted address')

      await (
        await litContracts.pkpNftContract.write.transferFrom(
          '0xb81798b54005170F23f08351F4C26C4e736e26C0',
          address,
          pkpId
        )
      ).wait()

      const params = [
        wallet.address,
        '1',
        {
          from
        }
      ]
      const estimation = await contract.estimateGas.transfer(...params)
      console.log(estimation)

      const feeData = await provider.getFeeData()
      console.log(feeData)

      const nonce = await provider.getTransactionCount(from)
      console.log(nonce)

      const tx = await contract.populateTransaction.transfer(...params)
      tx.type = 2
      tx.nonce = nonce
      tx.chainId = chainId
      tx.maxFeePerGas = feeData.maxFeePerGas.toHexString()
      tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas.toHexString()
      tx.gasLimit = estimation.toHexString()
      console.log(tx)

      // get authentication signature to deploy call the action
      var authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: 'mumbai'
      })

      const serialized = ethers.utils.serializeTransaction(tx)
      console.log(serialized)

      const hash = ethers.utils.keccak256(serialized)
      console.log('hash', hash)

      // this does both deployment action calling in the same code
      // need to break it down to upload to ipfs separately
      const resp = await litNodeClient.executeJs({
        ipfsId: cid,
        authSig,
        // all jsParams can be used anywhere in your litActionCode
        jsParams: {
          tx: ethers.utils.arrayify(hash),
          publicKey,
          sigName: 'sig1'
        }
      })
      const sig = resp.signatures.sig1
      const dataSigned = sig.dataSigned

      // validations

      const recoveredAddress = recoverAddress(dataSigned, sig.signature)
      console.log('recoveredAddress', recoveredAddress, hash, sig.dataSigned)

      console.log(resp.signatures.sig1)
      const serialized2 = ethers.utils.serializeTransaction(tx, resp.signatures.sig1.signature)
      console.log(serialized2)
      // console.log(ethers.utils.parse(serialized2));
      const sent = await provider.sendTransaction(serialized2)
      console.log(sent)
      console.log(await sent.wait())
    } catch (err) {
      console.log(err)
    }
  }

  // test();

  if (!publicKey) {
    return null
  }

  return (
    <div className="App">
      <button className="btn btn-xs" onClick={executeLitAction1}>
        Execute Action1
      </button>
      <button className="btn btn-xs" onClick={checkPermissions}>
        Check Permissions
      </button>
      <button className="btn btn-xs" onClick={addPermittedAddress}>
        Add Permitted Address
      </button>
      <button className="btn btn-xs" onClick={executeLitAction2}>
        Execute Action2
      </button>
      <button className="btn btn-xs" onClick={executeGetPermissionsAction}>
        Execute Read Permissions
      </button>
      <button className="btn btn-xs" onClick={addPermittedActionIpfsCid}>
        Add permitted action
      </button>
      <button className="btn btn-xs" onClick={executeGetPermissionsIpfs}>
        Execute IPFS Action
      </button>
      <button className="btn btn-xs" onClick={testSignature}>
        Test Signature
      </button>
      <button className="btn btn-xs" onClick={transferErc20}>
        Transfer ERc20
      </button>
      <hr />
      <br />
    </div>
  )
}

export default Sign
