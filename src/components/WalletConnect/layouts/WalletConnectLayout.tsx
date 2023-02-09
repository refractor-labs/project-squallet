import useInitialization from '@/hooks/useInitialization'
import useWalletConnectEventsManager from '@/hooks/useWalletConnectEventsManager'
import { createLegacySignClient } from '@/utils/LegacyWalletConnectUtil'
import { createTheme, NextUIProvider } from '@nextui-org/react'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'

export const WalletConnectLayout = ({ children }: { children: React.ReactNode }) => {
  const initialized = useInitialization()
  useWalletConnectEventsManager(initialized)

  // Backwards compatibility only - create a legacy v1 SignClient instance.
  createLegacySignClient()
  return (
    <NextUIProvider theme={createTheme({ type: 'dark' })}>
      <Layout initialized={initialized}>{children}</Layout>
      <Modal />
    </NextUIProvider>
  )
}
