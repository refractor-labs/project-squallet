import SettingsStore from '@/walletconnect/store/SettingsStore'
import {
  createOrRestoreEIP155Wallet,
  restorePkpWallet
} from '@/walletconnect/utils/EIP155WalletUtil'
import { createSignClient } from '@/walletconnect/utils/WalletConnectUtil'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'
import { Signer } from 'ethers'

export default function useInitialization(signer: Signer | undefined) {
  const [initialized, setInitialized] = useState(false)
  const prevRelayerURLValue = useRef<string>('')

  const { relayerRegionURL } = useSnapshot(SettingsStore.state)

  const onInitialize = useCallback(async () => {
    try {
      if (!signer) {
        return
      }
      const { eip155Addresses } = await restorePkpWallet(signer)

      SettingsStore.setEIP155Address(eip155Addresses[0])

      await createSignClient(relayerRegionURL)
      prevRelayerURLValue.current = relayerRegionURL

      setInitialized(true)
    } catch (err: unknown) {
      alert(err)
    }
  }, [relayerRegionURL, signer])

  useEffect(() => {
    if (!initialized) {
      onInitialize()
    }
    if (prevRelayerURLValue.current !== relayerRegionURL) {
      setInitialized(false)
      onInitialize()
    }
  }, [initialized, onInitialize, relayerRegionURL])

  return initialized
}
