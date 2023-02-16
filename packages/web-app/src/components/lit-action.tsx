import { ipfs } from '@/utils/ipfs'
import { LitContracts } from '@lit-protocol/contracts-sdk'
import { useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { usePkpAddress, usePkpId, usePublicKey } from '@/utils/localstorage'

const defaultCode = `
const go = async () => {  
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (message, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await Lit.Actions.ethPersonalSignMessageEcdsa({ message, publicKey , sigName });
};
go();
`

type Props = {
  onUpload: (cid: string) => void
}
export default function LitAction({ onUpload }: Props) {
  const [cid, setCid] = useLocalStorage('cid', '')
  const [code, setCode] = useState(defaultCode)
  const [loading, setLoading] = useState(false)
  const [signers, setSigners] = useState<string>()
  const [pkpId] = usePkpId()
  const [address] = usePkpAddress()
  const [owner, setOwner] = useState('')

  useEffect(() => {
    ;(async () => {
      const litContracts = new LitContracts()
      await litContracts.connect()

      const owner = await litContracts.pkpNftContract.read.ownerOf(pkpId)
      setOwner(owner)
    })()
  }, [pkpId])

  const onClickCreate = async () => {
    if (!signers) {
      alert('Please add signers')
      return
    }
    setLoading(true)
    try {
      const litContracts = new LitContracts()
      await litContracts.connect()
      const { cid } = await ipfs.add(code)
      if (owner === address) {
        alert('Need to get pkp to sign the tx')
      } else {
        const addTx = await litContracts.pkpPermissionsContractUtil.write.addPermittedAction(
          pkpId,
          cid.toString()
        )
        await addTx.wait()
        const signer = await litContracts.signer.getAddress()
        const transferTx = await litContracts.pkpNftContract.write.transferFrom(
          signer,
          address,
          pkpId
        )
        const owner = await litContracts.pkpNftContract.read.ownerOf(pkpId)
        setOwner(owner)
      }
      setCid(cid.toString())
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
      <h3 className="font-bold">Approved Action:</h3>
      <span>
        {cid ? (
          <a href={`https://explore.ipld.io/#/explore/${cid}`} target="_blank" rel="noreferrer">
            {cid}
          </a>
        ) : (
          'None'
        )}
      </span>
      <h3 className="font-bold">Approved Signers (one per line):</h3>
      <span>
        <textarea className="w-full border input mt-2" onChange={e => setSigners(e.target.value)}>
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
