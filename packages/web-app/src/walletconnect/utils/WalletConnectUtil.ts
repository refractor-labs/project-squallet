import SignClient from '@walletconnect/sign-client'

export let signClient: SignClient

export async function createSignClient(relayerRegionURL: string) {
  signClient = await SignClient.init({
    logger: 'debug',
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    relayUrl: relayerRegionURL ?? process.env.NEXT_PUBLIC_RELAY_URL,
    metadata: {
      name: 'Lore Wallet MVP',
      description: 'Lore Wallet MVP for WalletConnect',
      url: 'https://prysm.xyz/',
      icons: ['https://avatars.githubusercontent.com/u/37784886']
    }
  })
}
