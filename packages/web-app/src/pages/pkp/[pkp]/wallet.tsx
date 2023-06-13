import AccountCard from '@/walletconnect/components/AccountCard'
import AccountPicker from '@/walletconnect/components/AccountPicker'
import PageHeader from '@/walletconnect/components/PageHeader'
import { EIP155_MAINNET_CHAINS, EIP155_TEST_CHAINS } from '@/walletconnect/data/EIP155Data'
import SettingsStore from '@/walletconnect/store/SettingsStore'
import { Text } from '@nextui-org/react'
import { Fragment, ReactElement } from 'react'
import { useSnapshot } from 'valtio'
import { useLitActionSource } from '@/hooks/lit-action/useLitActionSource'

export default function WalletPage() {
  const { testNets, eip155Address } = useSnapshot(SettingsStore.state)

  return (
    <Fragment>
      <PageHeader title="Accounts">
        <AccountPicker />
      </PageHeader>
      <Text h4 css={{ marginBottom: '$5' }}>
        Mainnets
      </Text>
      {Object.values(EIP155_MAINNET_CHAINS).map(({ name, logo, rgb }) => (
        <AccountCard key={name} name={name} logo={logo} rgb={rgb} address={eip155Address} />
      ))}

      {testNets ? (
        <Fragment>
          <Text h4 css={{ marginBottom: '$5' }}>
            Testnets
          </Text>
          {Object.values(EIP155_TEST_CHAINS).map(({ name, logo, rgb }) => (
            <AccountCard key={name} name={name} logo={logo} rgb={rgb} address={eip155Address} />
          ))}
        </Fragment>
      ) : null}
    </Fragment>
  )
}
