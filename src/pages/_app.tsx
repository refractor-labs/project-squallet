import type { AppProps } from 'next/app'
import '../../public/main.css'
import { createClient, WagmiConfig } from 'wagmi'
import { getDefaultProvider } from 'ethers'
const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider()
})
export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || (page => page)

  return <WagmiConfig client={client}>{getLayout(<Component {...pageProps} />)}</WagmiConfig>
}
