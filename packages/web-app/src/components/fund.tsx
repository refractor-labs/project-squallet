import { usePkpAddress, usePkpId, usePublicKey } from '@/utils/localstorage'
import { LitContracts } from '@lit-protocol/contracts-sdk'
import { ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

export default function Fund() {
  const [publicKey] = usePublicKey()
  const [address] = usePkpAddress()
  const [pkpId] = usePkpId()
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState('0')

  const updateBalance = useCallback(async () => {
    const litContracts = new LitContracts()
    await litContracts.connect()
    try {
      const balance = await litContracts.provider.getBalance(address)
      setBalance(ethers.utils.formatUnits(balance.toString(), 18))
    } catch (err) {
      console.error(err)
    }
  }, [address])

  useEffect(() => {
    updateBalance()
  }, [updateBalance])

  const fund = async () => {
    try {
      setLoading(true)
      // initialization
      const litContracts = new LitContracts()
      await litContracts.connect()

      console.log('Sending gas to PKP')
      const gasTx = await litContracts.signer.sendTransaction({
        to: address,
        value: '10000000000000000'
      })
      console.log(await gasTx.wait())
      console.log(`Gas sent to ${address}`)

      await updateBalance()
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  if (!address) {
    return null
  }

  return (
    <div className="break-all text-xs space-y-6">
      <h2 className="font-bold">Public key</h2>
      <code>{publicKey}</code>
      <h2 className="font-bold">PKP Address</h2>
      <code>{address}</code>
      <h2 className="font-bold">PKP ID</h2>
      <code>{pkpId}</code>
      <h2 className="font-bold">Balance</h2>
      <code>{balance} MATIC</code>
      <div className="card-actions justify-end">
        <button className={`btn btn-sm ${loading ? 'loading' : ''}`} onClick={fund}>
          Fund PKP (0.01 MATIC)
        </button>
      </div>
    </div>
  )
}
