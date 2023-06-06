import { getDefaultProvider } from 'ethers'
import { configureChains, createClient, goerli, mainnet } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { MetaMaskConnector } from '@wagmi/connectors/metaMask'
import { InjectedConnector } from '@wagmi/connectors/injected'
import { infuraProvider } from '@wagmi/core/providers/infura'
import { chronicleChain } from '@/utils/chains'

const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY as string

export const { chains, provider, webSocketProvider } = configureChains(
  [
    mainnet,
    chronicleChain,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [goerli] : [])
  ],
  [infuraProvider({ apiKey: INFURA_KEY }), publicProvider()]
)
// Set up client
export const wagmiClient = createClient({
  autoConnect: true,
  connectors: [
    // new MetaMaskConnector({ chains }),
    // new CoinbaseWalletConnector({
    //   chains,
    //   options: {
    //     appName: 'wagmi',
    //   },
    // }),
    // new WalletConnectConnector({
    //   chains,
    //   options: {
    //     projectId: '...',
    //   },
    // }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true
      }
    })
  ],
  provider,
  webSocketProvider
})
