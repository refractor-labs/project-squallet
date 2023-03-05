import Transactions from '@/components/transactions'
import PageHeader from '@/walletconnect/components/PageHeader'

export default function TransactionsPage() {
  return (
    <>
      <PageHeader title="Transactions" />
      <Transactions />
    </>
  )
}
