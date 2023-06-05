import { ethers } from 'ethers'
import { useCallback, useContext, useEffect, useState } from 'react'
import { WalletContext } from '@/contexts/wallet-standalone'

export default function Fund() {
  const { pkpPublicKey, pkpAddress, pkpId, litContracts } = useContext(WalletContext)
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState('0')
  const [nonce, setNonce] = useState(0)

  const updateBalance = useCallback(async () => {
    if (!pkpAddress) {
      return
    }
    await litContracts.connect()
    try {
      const balance = await litContracts.provider.getBalance(pkpAddress)
      setBalance(ethers.utils.formatUnits(balance.toString(), 18))
    } catch (err) {
      console.error(err)
    }
  }, [pkpAddress])

  const updateNonce = useCallback(async () => {
    if (!pkpAddress) {
      return
    }
    await litContracts.connect()
    try {
      const nonce = await litContracts.provider.getTransactionCount(pkpAddress)
      setNonce(nonce)
    } catch (err) {
      console.error(err)
    }
  }, [pkpAddress])

  useEffect(() => {
    updateBalance()
  }, [updateBalance])

  useEffect(() => {
    updateNonce()
  }, [updateNonce])

  const fund = async () => {
    try {
      setLoading(true)
      // initialization
      await litContracts.connect()

      console.log('Sending gas to PKP')
      const gasTx = await litContracts.signer.sendTransaction({
        to: pkpAddress,
        value: '100000'
      })
      console.log(await gasTx.wait())
      console.log(`Gas sent to ${pkpAddress}`)

      await updateBalance()
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  if (!pkpAddress) {
    return null
  }

  return (
    <div className="break-all text-xs space-y-6">
      <h2 className="font-bold">Public key</h2>
      <code>{pkpPublicKey}</code>
      <h2 className="font-bold">PKP Address</h2>
      <code>{pkpAddress}</code>
      <h2 className="font-bold">PKP ID</h2>
      <code>{pkpId}</code>
      <h2 className="font-bold">Balance</h2>
      <code>{balance} MATIC</code>
      <h2 className="font-bold">Nonce</h2>
      <code>{nonce}</code>
      <div className="card-actions justify-end">
        <button className={`btn btn-sm ${loading ? 'loading' : ''}`} onClick={fund}>
          Fund PKP (0.01 MATIC)
        </button>
      </div>
    </div>
  )
}
