import useApi from '@/hooks/useApi'
import { TransactionDetailed } from '@refactor-labs-lit-protocol/api-client'
import { useRouter } from 'next/router'
import { useCallback, useContext, useEffect, useState } from 'react'
import Transaction from './transaction'
import { WalletContext } from '@/contexts/wallet-standalone'
import { useProvider } from 'wagmi'

function Transactions() {
  const [transactions, setTransactions] = useState<TransactionDetailed[] | null>(null)
  const [nonce, setNonce] = useState<number | null>(null)
  const { pkpAddress, litContracts } = useContext(WalletContext)

  const router = useRouter()
  const { safeApi } = useApi()
  // const safe = router.query.safe as string
  const provider = useProvider()

  const updateNonce = useCallback(async () => {
    if (!pkpAddress) {
      return
    }
    // await litContracts.connect()
    try {
      const nonce = await provider.getTransactionCount(pkpAddress)
      setNonce(nonce)
    } catch (err) {
      console.error(err)
    }
  }, [litContracts, pkpAddress])

  const loadData = useCallback(async () => {
    await updateNonce()
    if (!pkpAddress || !safeApi) {
      return
    }
    safeApi.getTransactions(pkpAddress).then(r => setTransactions(r.data))
  }, [safeApi, pkpAddress, updateNonce])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (!transactions || nonce === null) {
    return null
  }

  return (
    <div className="divide-y">
      {transactions.map((t, index) => (
        <Transaction
          key={t.id}
          transaction={t}
          onUpdate={loadData}
          baseNonce={nonce}
          nonce={nonce + index}
        />
      ))}
    </div>
  )
}

export default Transactions
