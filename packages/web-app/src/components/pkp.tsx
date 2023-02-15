import { LitContracts } from '@lit-protocol/contracts-sdk'
import { ethers } from 'ethers'
import { useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'

function PKP() {
  const [publicKey, setPublicKey] = useLocalStorage('publicKey', '')
  const [pkpId, setPkpId] = useLocalStorage('pkpId', '')
  const [address, setAddress] = useLocalStorage('address', '')
  const [loading, setLoading] = useState(false)
  const [_, setCid] = useLocalStorage('cid', '')

  const mintPkp = async () => {
    try {
      setLoading(true)
      // initialization
      const litContracts = new LitContracts()
      await litContracts.connect()

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
      setCid('')
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  return (
    <div className="break-all text-xs space-y-6">
      <h2 className="font-bold">Public key</h2>
      <code>{publicKey}</code>
      <h2 className="font-bold">PKP Address</h2>
      <code>{address}</code>
      <h2 className="font-bold">PKP ID</h2>
      <code>{pkpId}</code>
      <div className="card-actions justify-end">
        <button className={`btn btn-sm ${loading ? 'loading' : ''}`} onClick={mintPkp}>
          Mint PKP
        </button>
      </div>
    </div>
  )
}

export default PKP
