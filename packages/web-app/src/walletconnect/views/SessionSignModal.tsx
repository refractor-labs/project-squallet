import ProjectInfoCard from '@/walletconnect/components/ProjectInfoCard'
import RequesDetailsCard from '@/walletconnect/components/RequestDetalilsCard'
import RequestMethodCard from '@/walletconnect/components/RequestMethodCard'
import RequestModalContainer from '@/walletconnect/components/RequestModalContainer'
import ModalStore from '@/walletconnect/store/ModalStore'
import {
  approveEIP155Request,
  rejectEIP155Request
} from '@/walletconnect/utils/EIP155RequestHandlerUtil'
import { getSignParamsMessage } from '@/walletconnect/utils/HelperUtil'
import { signClient } from '@/walletconnect/utils/WalletConnectUtil'
import { Button, Col, Divider, Modal, Row, Text } from '@nextui-org/react'
import { Fragment } from 'react'

export default function SessionSignModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent
  const requestSession = ModalStore.state.data?.requestSession

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Text>Missing request data</Text>
  }

  // Get required request data
  const { topic, params } = requestEvent
  const { request, chainId } = params

  // Get message, convert it to UTF8 string if it is valid hex
  const message = getSignParamsMessage(request.params)

  // Handle approve action (logic varies based on request method)
  async function onApprove() {
    if (requestEvent) {
      const response = await approveEIP155Request(requestEvent)
      await signClient.respond({
        topic,
        response
      })
      ModalStore.close()
    }
  }

  // Handle reject action
  async function onReject() {
    if (requestEvent) {
      const response = rejectEIP155Request(requestEvent)
      await signClient.respond({
        topic,
        response
      })
      ModalStore.close()
    }
  }

  return (
    <Fragment>
      <RequestModalContainer title="Sign Message">
        <ProjectInfoCard metadata={requestSession.peer.metadata} />

        <Divider y={2} />

        <RequesDetailsCard chains={[chainId ?? '']} protocol={requestSession.relay.protocol} />

        <Divider y={2} />

        <Row>
          <Col>
            <Text h5>Message</Text>
            <Text color="$gray400">{message}</Text>
          </Col>
        </Row>

        <Divider y={2} />

        <RequestMethodCard methods={[request.method]} />
      </RequestModalContainer>

      <Modal.Footer>
        <Button auto flat color="error" onClick={onReject}>
          Reject
        </Button>
        <Button auto flat color="success" onClick={onApprove}>
          Approve
        </Button>
      </Modal.Footer>
    </Fragment>
  )
}
