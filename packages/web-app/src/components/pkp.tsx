import { LitContracts } from '@lit-protocol/contracts-sdk'
import { useState } from 'react'
import { useRouter } from 'next/router'

function PKP() {
  const [loading, setLoading] = useState(false)

  const router = useRouter()

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
      router.push(`/pkp/${tokenId}`)
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  return (
    <div className="break-all text-xs space-y-6 text-center">
      <button className={`btn btn-sm ${loading ? 'loading' : ''}`} onClick={mintPkp}>
        Mint PKP
      </button>
    </div>
  )
}

export default PKP
