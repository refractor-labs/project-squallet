// @flow
import * as React from 'react'
import { useCallback } from 'react'
import { useAccount, useConnect, useNetwork, useSwitchNetwork } from 'wagmi'

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

  console.log('connect', connect)
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
      <select onChange={onSelect}>
        <option value="1">Ethereum</option>
        <option value="175177">Chronicle</option>
      </select>
    </div>
  )
}
