import { WalletContext } from '@/contexts/wallet-standalone'
import RequestModalContainer from '@/walletconnect/components/RequestModalContainer'
import ModalStore from '@/walletconnect/store/ModalStore'
import { Button, Col, Divider, Loading, Modal, Row, Text } from '@nextui-org/react'
import { Fragment, useCallback, useContext, useState } from 'react'
import useApi from '@/hooks/useApi'

export default function SessionCreateTransactionModal() {
  const [loading, setLoading] = useState(false)
  const { litContracts, pkpAddress } = useContext(WalletContext)
  const { safeApi } = useApi()
  const [to, setTo] = useState<string>('')
  const [data, setData] = useState<string>('')
  const [value, setValue] = useState<string>('')

  var Web3 = require('web3')
  var web3 = new Web3(Web3.givenProvider)

  const createTransaction = useCallback(async () => {
    setLoading(true)
    const feeData = await litContracts.provider.getFeeData()
    const safe = ''
    await safeApi.createTransaction(safe, '', '', {
      to,
      data,
      from: pkpAddress,
      type: 2,
      nonce: await litContracts.provider.getTransactionCount(pkpAddress),
      value,
      chainId: 80001,
      gasLimit:
        '0x' +
        (
          await web3.eth.estimateGas({
            from: pkpAddress,
            nonce: await litContracts.provider.getTransactionCount(pkpAddress),
            to: to,
            data: data
          })
        ).toString(16),
      maxFeePerGas: feeData.maxFeePerGas.toHexString(),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas.toHexString()
    })
    ModalStore.close()
    setLoading(false)
  }, [safeApi, pkpAddress, litContracts.provider, web3.eth, to, data, value])

  return (
    <Fragment>
      <RequestModalContainer title="Create Transaction">
        <Row>
          <Col>
            <Text h5>To</Text>
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs text-gray-400"
              onChange={e => {
                setTo(e.target.value)
              }}
            />
          </Col>
        </Row>
        <Divider y={2} />
        <Row>
          <Col>
            <Text h5>Data</Text>
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs text-gray-400"
              onChange={e => {
                setData(e.target.value)
              }}
            />
          </Col>
        </Row>
        <Divider y={2} />
        <Row>
          <Col>
            <Text h5>Value</Text>
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs text-gray-400"
              onChange={e => {
                setValue(e.target.value)
              }}
            />
          </Col>
        </Row>
      </RequestModalContainer>
      <Modal.Footer>
        <Button auto flat color="success" onClick={createTransaction} disabled={loading}>
          Create
        </Button>
        <Button
          auto
          flat
          color="error"
          onClick={() => {
            ModalStore.close()
          }}
        >
          Abort
        </Button>
      </Modal.Footer>
    </Fragment>
  )
}
