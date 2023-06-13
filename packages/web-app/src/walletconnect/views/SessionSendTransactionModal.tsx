import { WalletContext } from '@/contexts/wallet-standalone'
import ProjectInfoCard from '@/walletconnect/components/ProjectInfoCard'
import RequestDataCard from '@/walletconnect/components/RequestDataCard'
import RequesDetailsCard from '@/walletconnect/components/RequestDetalilsCard'
import RequestMethodCard from '@/walletconnect/components/RequestMethodCard'
import RequestModalContainer from '@/walletconnect/components/RequestModalContainer'
import ModalStore from '@/walletconnect/store/ModalStore'
import { rejectEIP155Request } from '@/walletconnect/utils/EIP155RequestHandlerUtil'
import { signClient } from '@/walletconnect/utils/WalletConnectUtil'
import { Button, Divider, Loading, Modal, Text } from '@nextui-org/react'
import { Fragment, useContext, useEffect, useState } from 'react'
import useApi from '@/hooks/useApi'
import { useProvider } from 'wagmi'

export default function SessionSendTransactionModal() {
  const [loading, setLoading] = useState(false)
  const { litContracts, pkpAddress, signer } = useContext(WalletContext)
  const provider = useProvider()
  const [tx, setTx] = useState<any>(null)
  const { safeApi } = useApi()
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent
  const requestSession = ModalStore.state.data?.requestSession

  useEffect(() => {
    if (!transaction || !provider) {
      return
    }
    // Ensure request and wallet are defined
    if (!requestEvent || !requestSession) {
      return
    }
    ;(async () => {
      transaction.nonce = await provider.getTransactionCount(pkpAddress)
      const tx = JSON.parse(JSON.stringify(transaction))
      const feeData = await provider.getFeeData()
      if (!feeData.maxPriorityFeePerGas || !feeData.maxFeePerGas) {
        throw new Error('Missing fee data: ' + JSON.stringify(feeData))
      }
      tx.type = 2
      tx.chainId = chainId.indexOf(':') !== -1 ? chainId.split(':')[1] : chainId
      tx.maxFeePerGas = feeData.maxFeePerGas?.toHexString()
      delete tx.gasPrice
      tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas?.toHexString()
      setTx(tx)
    })()
  }, [requestEvent])

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Text>Missing request data</Text>
  }

  // Get required proposal data
  const { topic, params, id } = requestEvent
  const { request, chainId } = params
  const transaction = request.params[0]

  async function onSave() {
    setLoading(true)
    try {
      await safeApi.createTransaction(pkpAddress, topic, id.toString(10), tx)
      // await signClient.respond({
      //   topic,
      //   response: formatJsonRpcResult(id, hash),
      // })
      ModalStore.close()
    } catch (e) {
      console.error('failed to save Transaction, trying again?', e)
    } finally {
      setLoading(false)
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

  async function onAbort() {
    onReject()
  }

  return (
    <Fragment>
      <RequestModalContainer title="Send / Sign Transaction">
        <ProjectInfoCard metadata={requestSession.peer.metadata} />

        <Divider y={2} />

        <RequestDataCard data={transaction} />

        <Divider y={2} />

        <RequesDetailsCard chains={[chainId ?? '']} protocol={requestSession.relay.protocol} />

        <Divider y={2} />

        <RequestMethodCard methods={[request.method]} />
      </RequestModalContainer>
      <Modal.Footer>
        <Button auto flat color="error" onClick={onReject} disabled={loading}>
          Reject
        </Button>
        <Button auto flat color="success" onClick={onSave} disabled={loading}>
          {loading ? <Loading size="sm" color="success" /> : 'Save'}
        </Button>
        <Button auto flat color="error" onClick={onAbort}>
          {'Abort'}
        </Button>
      </Modal.Footer>
    </Fragment>
  )
}
