import useApi from '@/hooks/useApi'
import { TransactionDetailed } from '@refactor-labs-lit-protocol/api-client'
import { useRouter } from 'next/router'
import {useCallback, useContext, useEffect, useState} from 'react'
import Transaction from './transaction'
import {WalletContext} from "@/contexts/wallet";

function Transactions() {
  const [transactions, setTransactions] = useState<TransactionDetailed[] | null>(null)
  const [nonce, setNonce] = useState<number | null>(null)
  const {
    address,
    litContracts
  } = useContext(WalletContext)

  const router = useRouter()
  const { safeApi } = useApi()
  const safe = router.query.safe as string

  const updateNonce = useCallback(async () => {
    if (!address) {
      return
    }
    await litContracts.connect()
    try {
      const nonce = await litContracts.provider.getTransactionCount(address)
      setNonce(nonce)
    } catch (err) {
      console.error(err)
    }
  }, [litContracts, address])

  const loadData = useCallback(async() => {
    await updateNonce();
    if (!safe || !safeApi) {
      return
    }
    safeApi.getTransactions(safe).then(r => setTransactions(r.data))
  }, [safeApi, safe, updateNonce])

  useEffect(() => {loadData()}, [loadData])

  if (!transactions || nonce === null) {
    return null
  }

  return (
    <div className="divide-y">
      {transactions.map((t, index) => (
        <Transaction key={t.id} transaction={t} onUpdate={loadData} baseNonce={nonce} nonce={nonce + index} />
      ))}
    </div>
  )
}

export default Transactions
