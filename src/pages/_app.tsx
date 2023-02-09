import Modal from '@/components/Modal'
import { NextUIProvider, createTheme } from '@nextui-org/react'
import type { AppProps } from 'next/app'
import { createLegacySignClient } from '@/utils/LegacyWalletConnectUtil'
import useWalletConnectEventsManager from '@/hooks/useWalletConnectEventsManager'
import useInitialization from '@/hooks/useInitialization'
import Layout from '@/components/Layout'
import '../../public/main.css'

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || (page => page)

  return getLayout(<Component {...pageProps} />)
}
