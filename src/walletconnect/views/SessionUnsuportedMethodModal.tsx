import ProjectInfoCard from '@/walletconnect/components/ProjectInfoCard'
import RequesDetailsCard from '@/walletconnect/components/RequestDetalilsCard'
import RequestMethodCard from '@/walletconnect/components/RequestMethodCard'
import RequestModalContainer from '@/walletconnect/components/RequestModalContainer'
import ModalStore from '@/walletconnect/store/ModalStore'
import { Button, Divider, Modal, Text } from '@nextui-org/react'
import { Fragment } from 'react'

export default function SessionUnsuportedMethodModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent
  const requestSession = ModalStore.state.data?.requestSession

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Text>Missing request data</Text>
  }

  // Get required request data
  const { topic, params } = requestEvent
  const { chainId, request } = params

  return (
    <Fragment>
      <RequestModalContainer title="Unsuported Method">
        <ProjectInfoCard metadata={requestSession.peer.metadata} />

        <Divider y={2} />

        <RequesDetailsCard chains={[chainId ?? '']} protocol={requestSession.relay.protocol} />

        <Divider y={2} />

        <RequestMethodCard methods={[request.method]} />
      </RequestModalContainer>

      <Modal.Footer>
        <Button auto flat color="error" onClick={ModalStore.close}>
          Close
        </Button>
      </Modal.Footer>
    </Fragment>
  )
}
