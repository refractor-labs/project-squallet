import SettingsStore from '@/walletconnect/store/SettingsStore'
import { createSignClient } from '@/walletconnect/utils/WalletConnectUtil'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'
import { WalletStandalone } from '@/contexts/wallet-standalone'

export default function useInitialization(context: WalletStandalone) {
  const [initialized, setInitialized] = useState(false)
  const prevRelayerURLValue = useRef<string>('')

  const { relayerRegionURL } = useSnapshot(SettingsStore.state)
  const { pkpPublicKey, pkpAddress, pkpId, signer, pkpWallet } = context

  const onInitialize = useCallback(async () => {
    try {
      if (!signer || !pkpPublicKey || !pkpId || !pkpAddress || !pkpWallet) {
        console.log('useInitialization: missing signer or pkp env vars', {
          signer,
          pkpPublicKey,
          pkpId,
          pkpAddress,
          pkpWallet
        })
        return
      }

      // const { eip155Addresses } = await restorePkpWallet(signer, {
      //   publicKey,
      //   pkpId: pkp,
      //   pkpAddress: address
      // })

      SettingsStore.setEIP155Address(await pkpWallet.wallet.getAddress())

      console.log('createSignClient')
      await createSignClient(relayerRegionURL)
      prevRelayerURLValue.current = relayerRegionURL

      setInitialized(true)
    } catch (err: unknown) {
      alert(err)
    }
  }, [relayerRegionURL, context])

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
