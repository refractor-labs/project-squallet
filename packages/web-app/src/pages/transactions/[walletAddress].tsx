import { useRouter } from 'next/router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { TransactionServiceStoreDb } from '@/lib/TxServiceStore'
import { TxService } from '@/lib/TransactionServiceI'
import { useContext } from 'react'
import { WalletContext } from '@/contexts/wallet'

export default function WalletTransaction() {
  const { signer } = useContext(WalletContext)

  const router = useRouter()
  const { walletAddress } = router.query

  const transactionsQuery = useQuery(['transactions', walletAddress], async () => {
    if (typeof walletAddress !== 'string') return Promise.resolve([])
    const txns = await new TransactionServiceStoreDb().getTransactions(walletAddress)
    console.log('txns', txns)
    return txns
  })

  const signTransactionMutation = useMutation(async (id: number) => {
    //
    // lalalal/
    const tx = transactionsQuery?.data?[id];
    if (typeof walletAddress !== 'string' || !signer || !tx) {
      throw new Error('Invalid wallet address or signer')
    }
    new TxService(walletAddress, signer, new TransactionServiceStoreDb()).signTransaction()
  })

  return (
    <div>
      <h1>Transactions for {walletAddress}</h1>
      {transactionsQuery.isLoading && <p>Loading...</p>}
      {transactionsQuery.isError && (
        <p>
          <>Error: {transactionsQuery.error}</>
        </p>
      )}
      {transactionsQuery.isSuccess && (
        <ul>
          {transactionsQuery.data.length === 0 && <p>No transactions found</p>}
          {transactionsQuery.data.map(tx => (
            <li key={tx.hash}>
              <a
                target={'_blank'}
                href={`/api/transactions?signerHash=${tx.hash}`}
                rel="noreferrer"
              >
                {tx.hash}
              </a>
              <ul>
                {!!tx.signatures?.length &&
                  tx.signatures.map(sig => (
                    <li key={sig.signerAddress}>
                      {sig.signerAddress} - {sig.signature}
                    </li>
                  ))}
              </ul>
              {!tx.signatures?.length && <>no signatures</>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
