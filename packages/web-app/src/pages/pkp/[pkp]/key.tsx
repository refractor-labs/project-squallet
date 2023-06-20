import Fund from '@/components/fund'
import LitAction from '@/components/lit-action'
import PageHeader from '@/walletconnect/components/PageHeader'
import PairingCard from '@/walletconnect/components/PairingCard'
import { signClient } from '@/walletconnect/utils/WalletConnectUtil'
import { Text } from '@nextui-org/react'
import { getSdkError } from '@walletconnect/utils'
import { Fragment, ReactElement, useState } from 'react'
import { useLitActionSource } from '@/hooks/lit-action/useLitActionSource'

export default function PairingsPage() {
  const [pairings, setPairings] = useState(signClient.pairing.values)
  console.log('pairings', pairings)

  async function onDelete(topic: string) {
    await signClient.disconnect({ topic, reason: getSdkError('USER_DISCONNECTED') })
    const newPairings = pairings.filter(pairing => pairing.topic !== topic)
    setPairings(newPairings)
  }

  return (
    <Fragment>
      <PageHeader title="PKP" />
      <Fund />
      <LitAction />
    </Fragment>
  )
}
