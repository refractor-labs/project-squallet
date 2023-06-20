import type { AppProps, AppType } from 'next/app'
import '../../public/main.css'
import DashboardLayout from '@/components/layouts/Dashboard'
import WalletStandalone from '@/contexts/wallet-standalone'
import { WagmiConfig } from 'wagmi'
import { wagmiClient } from '@/wagmi'
import { trpc } from '../utils/trpc'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <WalletStandalone>
        <DashboardLayout>
          <Component {...pageProps} />
        </DashboardLayout>
      </WalletStandalone>
    </WagmiConfig>
  )
}
export default trpc.withTRPC(MyApp)
