import { getDefaultProvider } from 'ethers'
import { createClient } from 'wagmi'

export const wagmiClient = createClient({
  autoConnect: true,
  provider: getDefaultProvider()
})
