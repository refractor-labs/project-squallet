import { WalletContext } from '@/contexts/wallet'
import { Avatar, Row } from '@nextui-org/react'
import Image from 'next/image'
import Link from 'next/link'
import { useContext } from 'react'
import { WalletContextStandalone } from '@/contexts/wallet-standalone'

export default function Navigation() {
  const { pkp } = useContext(WalletContextStandalone)
  return (
    <Row justify="space-between" align="center">
      <Link href={`/pkp/${pkp}/wallet`} passHref legacyBehavior>
        <a className="navLink">
          <Image alt="accounts icon" src="/icons/accounts-icon.svg" width={27} height={27} />
        </a>
      </Link>

      <Link href={`/pkp/${pkp}/key`} passHref legacyBehavior>
        <a className="navLink">
          <Image alt="sessions icon" src="/icons/accounts-icon.svg" width={27} height={27} />
        </a>
      </Link>

      <Link href={`/pkp/${pkp}/transactions`} passHref legacyBehavior>
        <a className="navLink">
          <Image alt="sessions icon" src="/icons/checkmark-icon.svg" width={27} height={27} />
        </a>
      </Link>

      <Link href={`/pkp/${pkp}`} passHref legacyBehavior>
        <a className="navLink">
          <Avatar
            size="lg"
            css={{ cursor: 'pointer' }}
            color="gradient"
            icon={
              <Image
                alt="wallet connect icon"
                src="/wallet-connect-logo.svg"
                width={30}
                height={30}
              />
            }
          />
        </a>
      </Link>

      <Link href={`/pkp/${pkp}/sessions`} passHref legacyBehavior>
        <a className="navLink">
          <Image alt="sessions icon" src="/icons/sessions-icon.svg" width={27} height={27} />
        </a>
      </Link>

      <Link href={`/pkp/${pkp}/pairings`} passHref legacyBehavior>
        <a className="navLink">
          <Image alt="pairings icon" src="/icons/pairings-icon.svg" width={25} height={25} />
        </a>
      </Link>

      <Link href={`/pkp/${pkp}/settings`} passHref legacyBehavior>
        <a className="navLink">
          <Image alt="settings icon" src="/icons/settings-icon.svg" width={27} height={27} />
        </a>
      </Link>
    </Row>
  )
}
