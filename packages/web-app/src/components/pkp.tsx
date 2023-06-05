import { LitContracts } from '@lit-protocol/contracts-sdk'
import { useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { trpc } from '@/utils/trpc'
import { WalletContext } from '@/contexts/wallet-standalone'

function PKP() {
  const wallet = useContext(WalletContext)
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const createPkpMutation = trpc.actions.createPkp.useMutation()
  const mintPkp = async () => {
    try {
      setLoading(true)
      const { pkpId } = await createPkpMutation.mutateAsync({
        owners: [wallet.signerAddress],
        threshold: 1
      })
      // // initialization
      // const litContracts = new LitContracts()
      // await litContracts.connect()
      //
      // // mint token
      // const mintCost = await litContracts.pkpNftContract.read.mintCost()
      // console.log('mintCost', mintCost)
      // const tx = await litContracts.pkpNftContract.write.mintNext(2, { value: mintCost })
      // console.log('tx', tx)
      // const txResp = await tx.wait()
      // console.log('txResp', txResp)
      //
      // // this token id belongs to the metamask that minted it
      // const transferEvent = txResp.events.find((e: any) => e.event === 'Transfer')
      // const tokenId = transferEvent?.topics[3]
      await router.push(`/pkp/${pkpId}`)
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
