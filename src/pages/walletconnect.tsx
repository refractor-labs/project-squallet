// @flow
import { parseUri } from '@walletconnect/utils'
import * as React from 'react'
import { Fragment, ReactElement, useState } from 'react'
import { createLegacySignClient } from '@/walletconnect/utils/LegacyWalletConnectUtil'
import { signClient } from '@/walletconnect/utils/WalletConnectUtil'
import { Button, Input, Loading, Text } from '@nextui-org/react'
import { WalletConnectLayout } from '@/walletconnect/components/layouts/WalletConnectLayout'
export default function WalletConnectPage() {
  const [uri, setUri] = useState('')
  const [loading, setLoading] = useState(false)
  async function onConnect(uri: string) {
    try {
      setLoading(true)
      const { version } = parseUri(uri)

      // Route the provided URI to the v1 SignClient if URI version indicates it, else use v2.
      if (version === 1) {
        createLegacySignClient({ uri })
      } else {
        await signClient.pair({ uri })
      }
    } catch (err: unknown) {
      alert(err)
    } finally {
      setUri('')
      setLoading(false)
    }
  }

  return (
    <Fragment>
      <Text size={13} css={{ textAlign: 'center', marginTop: '$10', marginBottom: '$10' }}>
        use walletconnect uri
      </Text>

      <Input
        css={{ width: '100%' }}
        bordered
        aria-label="wc url connect input"
        placeholder="e.g. wc:a281567bb3e4..."
        onChange={e => setUri(e.target.value)}
        value={uri}
        contentRight={
          <Button
            size="xs"
            disabled={!uri}
            css={{ marginLeft: -60 }}
            onClick={() => onConnect(uri)}
            color="gradient"
          >
            {loading ? <Loading size="sm" /> : 'Connect'}
          </Button>
        }
      />
    </Fragment>
  )
}
WalletConnectPage.getLayout = function getLayout(page: ReactElement) {
  return <WalletConnectLayout>{page}</WalletConnectLayout>
}
