import { useWalletContext } from '@/contexts/wallet-standalone'
import { useProvider, useQuery } from 'wagmi'
import { ipfs } from '@/utils/ipfs'

export const useLitActionSource = () => {
  const wallet = useWalletContext()
  return useQuery(['useLitActionSource', wallet.pkpAddress, wallet.actions], async () => {
    // console.log('hey hey here', provider, wallet.actions)
    if (!wallet.actions.length) {
      return []
    }

    const actionSources = await Promise.all(
      wallet.actions.map(async a => {
        const iter = await ipfs.get(a.cid)
        let res: Uint8Array | null = null
        for await (const uint8Array of iter) {
          res = uint8Array
          break
        }
        return { action: a, src: res || new Uint8Array() }
      })
    )
    const sources = actionSources.map(a => {
      let src = new TextDecoder().decode(a.src)
      if (src.startsWith(a.action.cid)) {
        // this ipfs client prepend the cid to the string, unsure why.
        src = src.slice(a.action.cid.length)
      }

      return { action: a.action, src: src }
    })
    return sources
  })
}
