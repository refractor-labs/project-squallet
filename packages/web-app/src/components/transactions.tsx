import useApi from '@/hooks/useApi'
import { TransactionDetailed } from '@refactor-labs-lit-protocol/api-client'
import { useRouter } from 'next/router'
import { useCallback, useContext, useEffect, useState } from 'react'
import Transaction from './transaction'
import { WalletContext } from '@/contexts/wallet-standalone'
import { useProvider } from 'wagmi'
import { useQuery } from '@tanstack/react-query'

function Transactions() {
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
      console.log('pizza NONCE set to ', nonce)
    } catch (err) {
      console.error('pizza NONCE error', err)
    }
  }, [provider, pkpAddress, setNonce])

  const { data: transactions, refetch } = useQuery(
    ['use-transactions', safeApi, pkpAddress, updateNonce],
    async ({ signal }) => {
      await updateNonce()
      if (!pkpAddress || !safeApi) {
        return
      }
      const data = await safeApi.getTransactions(pkpAddress, { signal })
      return data.data
    }
  )

  console.log({ transactions, nonce })
  if (!transactions || nonce === null) {
    return null
  }

  return (
    <div className="divide-y">
      {transactions.map((t, index) => (
        <Transaction
          key={t.id}
          transaction={t}
          onUpdate={refetch}
          baseNonce={nonce}
          nonce={nonce + index}
        />
      ))}
    </div>
  )
}

export default Transactions
