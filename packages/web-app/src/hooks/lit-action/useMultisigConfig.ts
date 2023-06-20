import { Action, useWalletContext } from '@/contexts/wallet-standalone'
import { useQuery } from 'wagmi'
import { useLitActionSource } from '@/hooks/lit-action/useLitActionSource'

export type MsConfig = { signers: string[]; threshold: number; action: Action; src: string }
// extract the signers and threshold from the source code.
const regex = /var\s*authorizedAddresses\s*=\s*(\[.+\]);\s*var\s*threshold\s*=\s*(\d+);/g
export const useMultisigConfig = () => {
  const wallet = useWalletContext()
  const { data: sources } = useLitActionSource()
  return useQuery(
    ['useMultisigConfig', wallet.pkpAddress, sources],
    async (): Promise<MsConfig[]> => {
      if (!sources) {
        return []
      }
      const sourcesWithMatches = sources.map(source => {
        //
        const matches = Array.from(source.src.matchAll(regex))
        console.log('matches', matches)
        if (matches.length > 1) {
          console.log('error, src code does not contain multisig config')
          return { ...source, signers: [], threshold: 0 }
        }
        const signers = JSON.parse(matches[0][1]) as string[]
        const threshold = parseInt(matches[0][2])
        return { ...source, signers, threshold }
      })
      return sourcesWithMatches
    }
  )
}

export const useActiveAction = () => {
  const msConfig = useMultisigConfig()
  return useQuery(['useActiveAction', msConfig.data], async () => {
    if (!msConfig.data) {
      return
    }
    const active = msConfig.data.find(a => !!a.signers)
    if (!active) {
      throw new Error('no active action found')
    }
    return active
  })
}
