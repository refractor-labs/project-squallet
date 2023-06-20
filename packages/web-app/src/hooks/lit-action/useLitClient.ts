import { useWalletContext } from '@/contexts/wallet-standalone'
import { useQuery } from '@tanstack/react-query'
import { litNetwork } from '@/constants'
import * as LitJsSdk from '@lit-protocol/lit-node-client'
import { noRefetchParams } from '@/hooks/util'

export const useLitClient = () => {
  const wallet = useWalletContext()

  return useQuery(
    ['useLitClient', wallet.pkpAddress],
    async () => {
      return new LitJsSdk.LitNodeClient({ litNetwork: litNetwork })
    },
    {
      enabled: !!wallet.pkpAddress,
      ...noRefetchParams()
    }
  )
}
