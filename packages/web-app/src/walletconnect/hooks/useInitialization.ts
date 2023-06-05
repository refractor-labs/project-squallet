import SettingsStore from '@/walletconnect/store/SettingsStore'
import { restorePkpWallet } from '@/walletconnect/utils/EIP155WalletUtil'
import { createSignClient } from '@/walletconnect/utils/WalletConnectUtil'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'
import { Wallet, WalletContext } from '@/contexts/wallet'
import { WalletStandalone } from '@/contexts/wallet-standalone'

export default function useInitialization(context: WalletStandalone) {
  const [initialized, setInitialized] = useState(false)
  const prevRelayerURLValue = useRef<string>('')

  const { relayerRegionURL } = useSnapshot(SettingsStore.state)
  const { publicKey, address, pkp, signer } = context

  const onInitialize = useCallback(async () => {
    try {
      if (!signer || !publicKey || !pkp || !address) {
        console.log('missing signer or pkp env vars', signer, publicKey, pkp, address)
        return
      }
      const { eip155Addresses } = await restorePkpWallet(signer, {
        publicKey,
        pkpId: pkp,
        pkpAddress: address
      })

      SettingsStore.setEIP155Address(eip155Addresses[0])

      console.log('createSignClient')
      await createSignClient(relayerRegionURL)
      prevRelayerURLValue.current = relayerRegionURL

      setInitialized(true)
    } catch (err: unknown) {
      alert(err)
    }
  }, [relayerRegionURL, signer, publicKey, pkp, address])

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
