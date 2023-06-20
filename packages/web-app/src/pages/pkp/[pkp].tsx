// @flow
import { parseUri } from '@walletconnect/utils'
import * as React from 'react'
import { Fragment, useContext, useState } from 'react'
import { createLegacySignClient } from '@/walletconnect/utils/LegacyWalletConnectUtil'
import { signClient } from '@/walletconnect/utils/WalletConnectUtil'
import { Button, Input, Loading, Text } from '@nextui-org/react'
import { WalletContext } from '@/contexts/wallet-standalone'
import { ethers } from 'ethers'
import { useLitActionSource } from '@/hooks/lit-action/useLitActionSource'
import { useMultisigConfig } from '@/hooks/lit-action/useMultisigConfig'

function WalletConnectPKPStandalonePage() {
  const [uri, setUri] = useState('')
  const [loading, setLoading] = useState(false)
  const walletContext = useContext(WalletContext)
  // console.log('walletContext', walletContext)
  const sources = useLitActionSource()
  const parsed = useMultisigConfig()
  async function onConnect(uri: string) {
    try {
      setLoading(true)
      const { version } = parseUri(uri)

      // Route the provided URI to the v1 SignClient if URI version indicates it, else use v2.
      if (version === 1) {
        createLegacySignClient({ uri })
      } else {
        await signClient.pair({ uri })
        await signClient.session.init()
        console.log(signClient)
      }
    } catch (err: unknown) {
      alert(err)
    } finally {
      setUri('')
      setLoading(false)
    }
  }

  return (
    <div className="divide-y space-y-10">
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
    </div>
  )
}
export default WalletConnectPKPStandalonePage
