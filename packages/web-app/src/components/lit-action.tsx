import { ipfs } from '@/utils/ipfs'
import { useContext, useState } from 'react'
import { ethers } from 'ethers'
import LitJsSdk from 'lit-js-sdk'
import base58 from 'bs58'
import { WalletContext } from '@/contexts/wallet'

const getCode = (signers: string[]) => `
const go = async () => {  
  const signers = ${JSON.stringify(signers)}
  const serialized = ethers.utils.serializeTransaction(tx)
  const hash = ethers.utils.keccak256(serialized)
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (tx, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await Lit.Actions.signEcdsa({ 
    toSign: ethers.utils.arrayify(hash), 
    publicKey, 
    sigName 
  });
};

go();`

const fromHexString = (hexString: string) =>
  Uint8Array.from((hexString.match(/.{1,2}/g) as any).map((byte: string) => parseInt(byte, 16)))

const hexToString = (hex: string): string => {
  const hashStr = base58.encode(fromHexString(hex.slice(2)))
  return hashStr
}
export default function LitAction() {
  const {
    publicKey,
    address,
    pkp,
    owner,
    actions,
    chainId,
    litContracts,
    litNodeClient,
  } = useContext(WalletContext);
  const [loading, setLoading] = useState(false)
  const [signers, setSigners] = useState<string>()

  const onClickDelete = async (id: string) => {
    if (!actions?.length || actions.length === 1) {
      alert('Please do not delete the only action left')
      return
    }
    if (!confirm('Are you sure you want to delete this action?')) {
      return
    }
    await litContracts.connect()
    await litNodeClient.connect()

    const params = [pkp, id, []]

    const estimation = await litContracts.pkpPermissionsContract.write
      .connect(address)
      .estimateGas.removePermittedAction(...params)
    const feeData = await litContracts.provider.getFeeData()
    const nonce = await litContracts.provider.getTransactionCount(address)
    const tx = await litContracts.pkpPermissionsContract.write
      .connect(address)
      .populateTransaction.removePermittedAction(...params)
    tx.type = 2
    tx.nonce = nonce
    tx.chainId = chainId
    tx.maxFeePerGas = feeData.maxFeePerGas.toHexString()
    tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas.toHexString()
    tx.gasLimit = estimation.toHexString()

    // get authentication signature to deploy call the action
    var authSig = await (LitJsSdk as any).checkAndSignAuthMessage({ chain: 'mumbai' })

    // this does both deployment action calling in the same code
    // need to break it down to upload to ipfs separately
    const resp = await litNodeClient.executeJs({
      ipfsId: actions[actions.length - 1].cid,
      authSig,
      // all jsParams can be used anywhere in your litActionCode
      jsParams: {
        tx,
        publicKey,
        sigName: 'sig1'
      }
    })
    console.log(resp)
    const serialized2 = ethers.utils.serializeTransaction(tx, resp.signatures.sig1.signature)
    console.log(serialized2)
    const sent = await litContracts.provider.sendTransaction(serialized2)
    console.log(sent)
    console.log(await sent.wait())
    document.dispatchEvent(new Event('reload'));
  }
  const onClickCreate = async () => {
    if (!signers) {
      alert('Please add signers')
      return
    }
    setLoading(true)
    try {
      await litContracts.connect()
      await litNodeClient.connect()

      const ipfsResp = await ipfs.add(getCode(signers.split('\n')))
      const newCid = ipfsResp.cid
      const signer = await litContracts.signer.getAddress()
      const { chainId } = await litContracts.provider.getNetwork()
      if (owner === address) {
        const params = [pkp, newCid.bytes, []]
        console.log(newCid)

        const estimation = await litContracts.pkpPermissionsContract.write
          .connect(address)
          .estimateGas.addPermittedAction(...params)
        const feeData = await litContracts.provider.getFeeData()
        const nonce = await litContracts.provider.getTransactionCount(address)
        const tx = await litContracts.pkpPermissionsContract.write
          .connect(address)
          .populateTransaction.addPermittedAction(...params)
        tx.type = 2
        tx.nonce = nonce
        tx.chainId = chainId
        tx.maxFeePerGas = feeData.maxFeePerGas.toHexString()
        tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas.toHexString()
        tx.gasLimit = estimation.toHexString()

        // get authentication signature to deploy call the action
        var authSig = await (LitJsSdk as any).checkAndSignAuthMessage({ chain: 'mumbai' })

        // this does both deployment action calling in the same code
        // need to break it down to upload to ipfs separately
        const resp = await litNodeClient.executeJs({
          ipfsId: actions[actions.length - 1].cid,
          authSig,
          // all jsParams can be used anywhere in your litActionCode
          jsParams: {
            tx,
            publicKey,
            sigName: 'sig1'
          }
        })
        console.log(resp)
        const serialized2 = ethers.utils.serializeTransaction(tx, resp.signatures.sig1.signature)
        console.log(serialized2)
        const sent = await litContracts.provider.sendTransaction(serialized2)
        console.log(sent)
        console.log(await sent.wait())
      } else {
        await litContracts.pkpPermissionsContractUtil.write.addPermittedAction(
          pkp,
          newCid.toString()
        )
        const transferTx = await litContracts.pkpNftContract.write.transferFrom(
          signer,
          address,
          pkp
        )
        await transferTx.wait()
      }
      document.dispatchEvent(new Event('reload'));
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  if (!owner || !address) {
    return null
  }
  return (
    <div className="text-xs space-y-6">
      <h3 className="font-bold">PKP Owner:</h3>
      <span>{owner}</span>
      <span className="badge badge-sm font-xs ml-3">{owner === address ? 'PKP' : 'Non-PKP'} </span>
      <h3 className="font-bold">Approved Actions:</h3>
      <span className="space-y-3">
        {actions?.map(a => {
          return (
            <p key={a.id} className="space-x-2">
              <a href={`https://ipfs.stibits.com/${a.cid}`} className="underline" target="_blank">
                {a.cid}
              </a>
              <button
                onClick={() => onClickDelete(a.id)}
                className="btn btn-xs btn-ghost text-xs"
              >
                x
              </button>
            </p>
          )
        })}
      </span>
      <h3 className="font-bold">Approved Signers (one per line):</h3>
      <span>
        <textarea
          className="w-full textarea textarea-bordered mt-2"
          onChange={e => setSigners(e.target.value)}
        >
          {signers}
        </textarea>
      </span>
      <div className="card-actions justify-end">
        <button className={`btn btn-sm ${loading ? 'loading' : ''}`} onClick={onClickCreate}>
          {owner === address ? 'Update Signers' : 'Transfer Onwership to PKP'}
        </button>
      </div>
    </div>
  )
}
