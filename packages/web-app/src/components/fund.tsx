import { LitContracts } from '@lit-protocol/contracts-sdk'
import { ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'

export default function Fund() {
  const [address] = useLocalStorage('address', '')
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
        value: '1000000000000000'
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
      <h2 className="font-bold">Balance</h2>
      <code>{balance} MATIC</code>
      <div className="card-actions justify-end">
        <button className={`btn btn-sm ${loading ? 'loading' : ''}`} onClick={fund}>
          Fund PKP (0.001 MATIC)
        </button>
      </div>
    </div>
  )
}
