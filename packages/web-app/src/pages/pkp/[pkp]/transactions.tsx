import Transactions from '@/components/transactions'
import PageHeader from '@/walletconnect/components/PageHeader'
import ModalStore from "@/walletconnect/store/ModalStore";

export default function TransactionsPage() {
  return (
    <>
      <PageHeader title="Transactions" >
        <p className='btn btn-xs' onClick={() => {ModalStore.open('SessionCreateTransactionModal', {})}}>
            Create
        </p>
      </PageHeader>
      <Transactions />
    </>
  )
}
