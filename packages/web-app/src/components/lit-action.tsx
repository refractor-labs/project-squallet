import { ipfs } from '@/utils/ipfs'
import { LitContracts } from '@lit-protocol/contracts-sdk'
import { useCallback, useEffect, useState } from 'react'
import { usePkpAddress, usePkpId, usePublicKey } from '@/utils/localstorage'
import { ethers } from 'ethers'
import LitJsSdk from 'lit-js-sdk'
import base58 from 'bs58'

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
  Uint8Array.from((hexString.match(/.{1,2}/g) as any).map((byte: string) => parseInt(byte, 16)));

const hexToString = (hex: string): string => {
  const hashStr = base58.encode(fromHexString(hex.slice(2)))
  return hashStr
}
type Props = {
  onUpload: (cid: string) => void
}
export default function LitAction({ onUpload }: Props) {
  const [publicKey] = usePublicKey()
  const [loading, setLoading] = useState(false)
  const [signers, setSigners] = useState<string>()
  const [pkpId] = usePkpId()
  const [address] = usePkpAddress()
  const [owner, setOwner] = useState('')
  const [actions, setActions] = useState<string[]>([]);

  useEffect(() => {
    const c = () => {
      const elem = document.getElementById('lit-connect-modal');
      if (elem) {
        if (elem.classList.contains('is-open')) {
          elem.classList.add('modal-open');
        } else if (elem.classList.contains('modal-open')) { 
          elem.classList.remove('modal-open');
        }
      }
    }
    const interval = setInterval(c, 1000);
    return () => clearInterval(interval);
  }, []);

  const readPkpData = useCallback(async () => {
    const litContracts = new LitContracts()
    await litContracts.connect()

    const owner = await litContracts.pkpNftContract.read.ownerOf(pkpId)
    setOwner(owner)

    const actions = await litContracts.pkpPermissionsContractUtil.read.getPermittedActions(pkpId);
    setActions(actions);
  }, [pkpId]);

  useEffect(() => { readPkpData() }, [readPkpData])

  const onClickDelete =async (bytes: Uint8Array) => {
    if (!actions?.length || actions.length === 1) {
      alert("Please do not delete the only action left");
      return
    }
    if (!confirm('Are you sure you want to delete this action?')) {
      return
    }
    const litContracts = new LitContracts()
    await litContracts.connect()
    const litNodeClient = new (LitJsSdk as any).LitNodeClient({ litNetwork: 'serrano' })
    await litNodeClient.connect()
    const { chainId } = await litContracts.provider.getNetwork()

    const params = [
      pkpId,
      bytes,
      [],
    ];

    const estimation = await litContracts.pkpPermissionsContract.write.connect(address).estimateGas.removePermittedAction(...params)
    const feeData = await litContracts.provider.getFeeData()
    const nonce = await litContracts.provider.getTransactionCount(address)
    const tx = await litContracts.pkpPermissionsContract.write.connect(address).populateTransaction.removePermittedAction(...params);
    tx.type = 2
    tx.nonce = nonce;
    tx.chainId = chainId
    tx.maxFeePerGas = feeData.maxFeePerGas.toHexString()
    tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas.toHexString()
    tx.gasLimit = estimation.toHexString()

    // get authentication signature to deploy call the action
    var authSig = await (LitJsSdk as any).checkAndSignAuthMessage({chain: 'mumbai'})

    // this does both deployment action calling in the same code
    // need to break it down to upload to ipfs separately
    const resp = await litNodeClient.executeJs({
      ipfsId: hexToString(actions[actions.length - 1]),
      authSig,
      // all jsParams can be used anywhere in your litActionCode
      jsParams: {
        tx,
        publicKey,
        sigName: 'sig1'
      }
    })
    console.log(resp);
    const serialized2 = ethers.utils.serializeTransaction(tx, resp.signatures.sig1.signature)
    console.log(serialized2)
    const sent = await litContracts.provider.sendTransaction(serialized2)
    console.log(sent)
    console.log(await sent.wait())
    await readPkpData();
  }
  const onClickCreate = async () => {
    if (!signers) {
      alert('Please add signers')
      return
    }
    setLoading(true)
    try {
      const litContracts = new LitContracts()
      await litContracts.connect()
      const litNodeClient = new (LitJsSdk as any).LitNodeClient({ litNetwork: 'serrano' })
      await litNodeClient.connect()

      const ipfsResp = await ipfs.add(getCode(signers.split('\n')))
      const newCid = ipfsResp.cid;
      const signer = await litContracts.signer.getAddress()
      const { chainId } = await litContracts.provider.getNetwork()
      if (owner === address) {
        const params = [
          pkpId,
          newCid.bytes,
          [],
        ];
        console.log(newCid)

        const estimation = await litContracts.pkpPermissionsContract.write.connect(address).estimateGas.addPermittedAction(...params)
        const feeData = await litContracts.provider.getFeeData()
        const nonce = await litContracts.provider.getTransactionCount(address)
        const tx = await litContracts.pkpPermissionsContract.write.connect(address).populateTransaction.addPermittedAction(...params);
        tx.type = 2
        tx.nonce = nonce;
        tx.chainId = chainId
        tx.maxFeePerGas = feeData.maxFeePerGas.toHexString()
        tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas.toHexString()
        tx.gasLimit = estimation.toHexString()

        // get authentication signature to deploy call the action
        var authSig = await (LitJsSdk as any).checkAndSignAuthMessage({chain: 'mumbai'})

        // this does both deployment action calling in the same code
        // need to break it down to upload to ipfs separately
        const resp = await litNodeClient.executeJs({
          ipfsId: hexToString(actions[actions.length - 1]),
          authSig,
          // all jsParams can be used anywhere in your litActionCode
          jsParams: {
            tx,
            publicKey,
            sigName: 'sig1'
          }
        })
        console.log(resp);
        const serialized2 = ethers.utils.serializeTransaction(tx, resp.signatures.sig1.signature)
        console.log(serialized2)
        const sent = await litContracts.provider.sendTransaction(serialized2)
        console.log(sent)
        console.log(await sent.wait())
      } else {
        await litContracts.pkpPermissionsContractUtil.write.addPermittedAction(
          pkpId,
          newCid.toString()
        )
        const transferTx = await litContracts.pkpNftContract.write.transferFrom(
          signer,
          address,
          pkpId
        )
        await transferTx.wait();
        const owner = await litContracts.pkpNftContract.read.ownerOf(pkpId)
        setOwner(owner)
      }
      await readPkpData();
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
      <span className='space-y-3'>
        {
          actions?.map(a => {
            const id = hexToString(a)
            return (
              <p key={a} className="space-x-2">
                <a href={`https://ipfs.stibits.com/${id}`} className="underline" target="_blank">
                  {id}
                </a>
                <button onClick={() => onClickDelete(fromHexString(a))} className='btn btn-xs btn-ghost text-xs'>x</button>
              </p>
            )
          })
        } 
      </span>
      <h3 className="font-bold">Approved Signers (one per line):</h3>
      <span>
        <textarea className="w-full textarea textarea-bordered mt-2" onChange={e => setSigners(e.target.value)}>
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
