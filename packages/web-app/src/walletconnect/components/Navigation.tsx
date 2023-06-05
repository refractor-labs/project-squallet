import { WalletContext } from '@/contexts/wallet-standalone'
import { Avatar, Row } from '@nextui-org/react'
import Image from 'next/image'
import Link from 'next/link'
import { useContext } from 'react'

export default function Navigation() {
  const { pkpId } = useContext(WalletContext)
  return (
    <Row justify="space-between" align="center">
      <Link href={`/pkp/${pkpId}/wallet`} passHref legacyBehavior>
        <a className="navLink">
          <Image alt="accounts icon" src="/icons/accounts-icon.svg" width={27} height={27} />
        </a>
      </Link>

      <Link href={`/pkp/${pkpId}/key`} passHref legacyBehavior>
        <a className="navLink">
          <Image alt="sessions icon" src="/icons/accounts-icon.svg" width={27} height={27} />
        </a>
      </Link>

      <Link href={`/pkp/${pkpId}/transactions`} passHref legacyBehavior>
        <a className="navLink">
          <Image alt="sessions icon" src="/icons/checkmark-icon.svg" width={27} height={27} />
        </a>
      </Link>

      <Link href={`/pkp/${pkpId}`} passHref legacyBehavior>
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

      <Link href={`/pkp/${pkpId}/sessions`} passHref legacyBehavior>
        <a className="navLink">
          <Image alt="sessions icon" src="/icons/sessions-icon.svg" width={27} height={27} />
        </a>
      </Link>

      <Link href={`/pkp/${pkpId}/pairings`} passHref legacyBehavior>
        <a className="navLink">
          <Image alt="pairings icon" src="/icons/pairings-icon.svg" width={25} height={25} />
        </a>
      </Link>

      <Link href={`/pkp/${pkpId}/settings`} passHref legacyBehavior>
        <a className="navLink">
          <Image alt="settings icon" src="/icons/settings-icon.svg" width={27} height={27} />
        </a>
      </Link>
    </Row>
  )
}
