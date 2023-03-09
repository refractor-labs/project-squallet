import ModalStore from '@/walletconnect/store/ModalStore'
import SessionProposalModal from '@/walletconnect/views/SessionProposalModal'
import SessionSendTransactionModal from '@/walletconnect/views/SessionSendTransactionModal'
import SessionRequestModal from '@/walletconnect/views/SessionSignModal'
import SessionSignTypedDataModal from '@/walletconnect/views/SessionSignTypedDataModal'
import SessionUnsuportedMethodModal from '@/walletconnect/views/SessionUnsuportedMethodModal'
import SessionCreateTransactionModal from '@/walletconnect/views/SessionCreateTransactionModal'
import LegacySessionProposalModal from '@/walletconnect/views/LegacySessionProposalModal'
import LegacySessionSignModal from '@/walletconnect/views/LegacySessionSignModal'
import LegacySessionSignTypedDataModal from '@/walletconnect/views/LegacySessionSignTypedDataModal'
import LegacySessionSendTransactionModal from '@/walletconnect/views/LegacySessionSendTransactionModal'
import { Modal as NextModal } from '@nextui-org/react'
import { useSnapshot } from 'valtio'

export default function Modal() {
  const { open, view } = useSnapshot(ModalStore.state)

  return (
    <NextModal blur open={open} style={{ border: '1px solid rgba(139, 139, 139, 0.4)' }}>
      {view === 'SessionProposalModal' && <SessionProposalModal />}
      {view === 'SessionSignModal' && <SessionRequestModal />}
      {view === 'SessionSignTypedDataModal' && <SessionSignTypedDataModal />}
      {view === 'SessionSendTransactionModal' && <SessionSendTransactionModal />}
      {view === 'SessionUnsuportedMethodModal' && <SessionUnsuportedMethodModal />}
      {view === 'SessionCreateTransactionModal' && <SessionCreateTransactionModal />}
      {view === 'LegacySessionProposalModal' && <LegacySessionProposalModal />}
      {view === 'LegacySessionSignModal' && <LegacySessionSignModal />}
      {view === 'LegacySessionSignTypedDataModal' && <LegacySessionSignTypedDataModal />}
      {view === 'LegacySessionSendTransactionModal' && <LegacySessionSendTransactionModal />}
    </NextModal>
  )
}
