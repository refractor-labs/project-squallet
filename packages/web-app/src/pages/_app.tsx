import type { AppProps } from 'next/app'
import '../../public/main.css'
import DashboardLayout from '@/components/layouts/Dashboard'
import WalletStandalone from '@/contexts/wallet-standalone'

export default function App({ Component, pageProps }: AppProps) {
  console.log('pizza in App', Component)
  return (
    <WalletStandalone>
      <DashboardLayout>
        <Component {...pageProps} />
      </DashboardLayout>
    </WalletStandalone>
  )
}
