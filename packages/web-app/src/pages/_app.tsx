import type { AppProps } from 'next/app'
import '../../public/main.css'
import DashboardLayout from '@/components/layouts/Dashboard'
import Wallet from '@/contexts/wallet'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Wallet>
      <DashboardLayout>
        <Component {...pageProps} />
      </DashboardLayout>
    </Wallet>
  )
}
