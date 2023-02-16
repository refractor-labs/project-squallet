import useInitialization from '@/walletconnect/hooks/useInitialization'
import useWalletConnectEventsManager from '@/walletconnect/hooks/useWalletConnectEventsManager'
import { createLegacySignClient } from '@/walletconnect/utils/LegacyWalletConnectUtil'
import { createTheme, NextUIProvider } from '@nextui-org/react'
import Layout from '@/walletconnect/components/Layout'
import Modal from '@/walletconnect/components/Modal'
import { Fragment } from 'react'
import { useAccount, useConnect, useDisconnect, useSigner } from 'wagmi'
import { InjectedConnector } from '@wagmi/connectors/injected'

export const WalletConnectLayout = ({ children }: { children: React.ReactNode }) => {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector()
  })
  const { disconnect } = useDisconnect()
  const { data: signer } = useSigner()
  const initialized = useInitialization(signer || undefined)

  useWalletConnectEventsManager(initialized)
  console.log('address', address)
  console.log('signer', signer)
  console.log('initialized', initialized)

  // Backwards compatibility only - create a legacy v1 SignClient instance.
  createLegacySignClient()
  return (
    <>
      <>
        <button onClick={() => connect()}>Connect</button>
        <button onClick={() => disconnect()}>Disconnect</button>
      </>
      <Layout initialized={initialized}>
        <Fragment>{children}</Fragment>
      </Layout>

      <Modal />
    </>
  )
}
