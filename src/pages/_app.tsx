import type { AppProps } from 'next/app'
import '../../public/main.css'
import { createClient, WagmiConfig } from 'wagmi'
import { getDefaultProvider } from 'ethers'
import { mainnet, polygon, polygonMumbai, goerli } from '@wagmi/core/chains'
import { configureChains } from '@wagmi/core'
import { publicProvider } from '@wagmi/core/providers/public'
import { InjectedConnector } from '@wagmi/connectors/injected'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const { chains, provider } = configureChains(
  [mainnet, goerli, polygon, polygonMumbai],
  [publicProvider()]
)
const client = createClient({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  provider
})
const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || (page => page)

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig client={client}>{getLayout(<Component {...pageProps} />)}</WagmiConfig>
    </QueryClientProvider>
  )
}
