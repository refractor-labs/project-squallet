import PageHeader from '@/components/WalletConnect/PageHeader'
import RelayRegionPicker from '@/components/WalletConnect/RelayRegionPicker'
import SettingsStore from '@/walletconnect/store/SettingsStore'
import { eip155Wallets } from '@/walletconnect/utils/EIP155WalletUtil'
import { Card, Divider, Row, Switch, Text } from '@nextui-org/react'
import { Fragment, ReactElement } from 'react'
import { useSnapshot } from 'valtio'
import packageJSON from '../../package.json'
import { WalletConnectLayout } from '@/components/WalletConnect/layouts/WalletConnectLayout'
import PairingsPage from '@/pages/pairings'

export default function SettingsPage() {
  const { testNets, eip155Address, cosmosAddress, solanaAddress, elrondAddress, tronAddress } =
    useSnapshot(SettingsStore.state)

  return (
    <Fragment>
      <PageHeader title="Settings" />

      <Text h4 css={{ marginBottom: '$5' }}>
        Packages
      </Text>
      <Row justify="space-between" align="center">
        <Text color="$gray400">@walletconnect/sign-client</Text>
        <Text color="$gray400">{packageJSON.dependencies['@walletconnect/sign-client']}</Text>
      </Row>
      <Row justify="space-between" align="center">
        <Text color="$gray400">@walletconnect/utils</Text>
        <Text color="$gray400">{packageJSON.dependencies['@walletconnect/utils']}</Text>
      </Row>
      <Row justify="space-between" align="center">
        <Text color="$gray400">@walletconnect/types</Text>
        <Text color="$gray400">{packageJSON.devDependencies['@walletconnect/types']}</Text>
      </Row>

      <Divider y={2} />

      <Text h4 css={{ marginBottom: '$5' }}>
        Testnets
      </Text>
      <Row justify="space-between" align="center">
        <Switch checked={testNets} onChange={SettingsStore.toggleTestNets} />
        <Text>{testNets ? 'Enabled' : 'Disabled'}</Text>
      </Row>

      <Divider y={2} />

      <Row justify="space-between" align="center">
        <Text h4 css={{ marginBottom: '$5' }}>
          Relayer Region
        </Text>
        <RelayRegionPicker />
      </Row>

      <Divider y={2} />

      <Text css={{ color: '$yellow500', marginBottom: '$5', textAlign: 'left', padding: 0 }}>
        Warning: mnemonics and secret keys are provided for development purposes only and should not
        be used elsewhere!
      </Text>

      <Text h4 css={{ marginTop: '$5', marginBottom: '$5' }}>
        EIP155 Mnemonic
      </Text>

      {/*<Text h4 css={{ marginTop: '$10', marginBottom: '$5' }}>*/}
      {/*  Solana Secret Key*/}
      {/*</Text>*/}
      {/*<Card bordered borderWeight="light" css={{ minHeight: '215px', wordWrap: 'break-word' }}>*/}
      {/*  <Text css={{ fontFamily: '$mono' }}>{solanaWallets[solanaAddress].getSecretKey()}</Text>*/}
      {/*</Card>*/}
    </Fragment>
  )
}
SettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <WalletConnectLayout>{page}</WalletConnectLayout>
}
