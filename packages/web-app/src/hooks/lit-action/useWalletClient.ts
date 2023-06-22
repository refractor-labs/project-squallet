import { useWalletContext } from '@/contexts/wallet-standalone'
import { useQuery } from '@tanstack/react-query'
import { noRefetchParams } from '@/hooks/util'
import { SqualletWalletTypes } from '@refactor-labs-lit-protocol/litlib'
import { SqualletWalletBrowserClient } from '@refactor-labs-lit-protocol/squallet'

export const useWalletClient = () => {
  const wallet = useWalletContext()
  return useQuery(
    ['useWalletClient', wallet.pkpAddress, wallet.actions],
    async (): Promise<SqualletWalletTypes | null> => {
      if (!wallet.actions || !wallet.signer) {
        return null
      }

      return new SqualletWalletBrowserClient(
        {
          pkpId: wallet.pkpId,
          pkpPublicKey: wallet.pkpPublicKey,
          pkpAddress: wallet.pkpAddress
        },
        wallet.signer,
        80001,
        (wallet.actions || [])[0].cid
      )
    },
    { enabled: !!wallet.actions && !!wallet.signer, ...noRefetchParams() }
  )
}