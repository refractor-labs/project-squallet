import { WalletContext } from '@/contexts/wallet'
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
import { ethers } from 'ethers'
import { formatJsonRpcResult } from '@json-rpc-tools/utils'
import useApi from '@/hooks/useApi'

export default function SessionSendTransactionModal() {
  const [loading, setLoading] = useState(false)
  const { litContracts, address, safe } = useContext(WalletContext)
  const [tx, setTx] = useState<any>(null)
  const { safeApi } = useApi()

  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent
  const requestSession = ModalStore.state.data?.requestSession

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Text>Missing request data</Text>
  }

  // Get required proposal data
  const { topic, params, id } = requestEvent
  const { request, chainId } = params
  const transaction = request.params[0]

  useEffect(() => {
    if (!transaction) {
      return
    }
    (async () => {
      transaction.nonce = await litContracts.provider.getTransactionCount(address)
      const tx = JSON.parse(JSON.stringify(transaction));
      const feeData = await litContracts.provider.getFeeData()
      tx.type = 2
      tx.chainId = chainId.indexOf(':') !== -1 ? chainId.split(':')[1] : chainId,
      tx.maxFeePerGas = feeData.maxFeePerGas.toHexString()
      delete tx.gasPrice
      tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas.toHexString()
      setTx(tx)
    })();
  }, [transaction])

  async function onSave() {
    setLoading(true)
    await safeApi.createTransaction(safe, topic, id.toString(10), tx)
    // await signClient.respond({
    //   topic,
    //   response: formatJsonRpcResult(id, hash),
    // })
    ModalStore.close()
    setLoading(false);
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
