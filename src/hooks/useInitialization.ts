import SettingsStore from '@/store/SettingsStore'
import {createOrRestoreEIP155Wallet, restorePkpWallet} from '@/utils/EIP155WalletUtil'
import {createSignClient} from '@/utils/WalletConnectUtil'
import {useCallback, useEffect, useRef, useState} from 'react'
import {useSnapshot} from 'valtio'

export default function useInitialization() {
    const [initialized, setInitialized] = useState(false)
    const prevRelayerURLValue = useRef<string>('')

    const {relayerRegionURL} = useSnapshot(SettingsStore.state)

    const onInitialize = useCallback(async () => {
        try {
            const {eip155Addresses} = await restorePkpWallet()
            // const { cosmosAddresses } = await createOrRestoreCosmosWallet()
            // const {solanaAddresses} = await createOrRestoreSolanaWallet()
            // const { polkadotAddresses } = await createOrRestorePolkadotWallet()
            // const { nearAddresses } = await createOrRestoreNearWallet()
            // const { elrondAddresses } = await createOrRestoreElrondWallet()
            // const { tronAddresses } = await createOrRestoreTronWallet()

            SettingsStore.setEIP155Address(eip155Addresses[0])
            // SettingsStore.setCosmosAddress(cosmosAddresses[0])
            // SettingsStore.setSolanaAddress(solanaAddresses[0])
            // SettingsStore.setPolkadotAddress(polkadotAddresses[0])
            // SettingsStore.setNearAddress(nearAddresses[0])
            // SettingsStore.setElrondAddress(elrondAddresses[0])
            // SettingsStore.setTronAddress(tronAddresses[0])
            await createSignClient(relayerRegionURL)
            prevRelayerURLValue.current = relayerRegionURL

            setInitialized(true)
        } catch (err: unknown) {
            alert(err)
        }
    }, [relayerRegionURL])

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
