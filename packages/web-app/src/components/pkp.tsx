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
      console.log('mintCost', mintCost)
      const tx = await litContracts.pkpNftContract.write.mintNext(2, { value: mintCost })
      console.log('tx', tx)
      const txResp = await tx.wait()
      console.log('txResp', txResp)

      // this token id belongs to the metamask that minted it
      const transferEvent = txResp.events.find((e: any) => e.event === 'Transfer')
      const tokenId = transferEvent?.topics[3]
      await router.push(`/${router.query.safe}/pkp/${tokenId}`)
    } catch (err) {
      console.log('failed to mint pkp', err)
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
