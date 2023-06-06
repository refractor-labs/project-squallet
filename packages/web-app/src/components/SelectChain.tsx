// @flow
import * as React from 'react'
import { useCallback } from 'react'
import { Chain, mainnet, useAccount, useConnect, useNetwork, useSwitchNetwork } from 'wagmi'
import { polygonMumbai } from '@wagmi/chains'
import { chronicleChain } from '@/utils/chains'

export const SelectChain = () => {
  const { connector: activeConnector, isConnected } = useAccount()
  const connect = useConnect()

  const { chain, chains } = useNetwork()
  const { error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
  const onSelect: React.ChangeEventHandler<HTMLSelectElement> = useCallback(
    e => {
      console.log('onSelect', e.currentTarget.value, { isLoading, pendingChainId, chain })
      if (isLoading) return
      // if (pendingChainId) return
      if (!switchNetwork) return
      const desiredChain = parseInt(e.currentTarget.value)
      console.log('onSelect desiredChain', desiredChain)
      if (chain?.id === desiredChain) return

      switchNetwork(desiredChain)
    },
    [chain, isLoading, pendingChainId, switchNetwork]
  )

  // const [chainLocalState, setChainLocalState] = React.useState<Chain>(mainnet)
  // React.useEffect(() => {
  //   if (chain) setChainLocalState(chain)
  //   else setChainLocalState(mainnet)
  // }, [])

  if (!isConnected) {
    return (
      <button
        disabled={connect.isLoading}
        onClick={() => connect.connect?.({ connector: connect.connectors[0], chainId: 1 })}
      >
        Connect
      </button>
    )
  }
  return (
    <div>
      <div>Connected to {chain?.name}</div>
      <select onChange={onSelect}>
        <option value={mainnet.id}>{mainnet.name}</option>
        <option value={chronicleChain.id}>{chronicleChain.name}</option>
        <option value={polygonMumbai.id}>{polygonMumbai.name}</option>
      </select>
    </div>
  )
}
