import { WalletContext } from '@/contexts/wallet'
import Navigation from '@/walletconnect/components/Navigation'
import RouteTransition from '@/walletconnect/components/RouteTransition'
import { Card, Container, Loading } from '@nextui-org/react'
import Link from 'next/link'
import { Fragment, ReactNode, useContext, useEffect } from 'react'
import { signClient } from '../utils/WalletConnectUtil'
import Modal from './Modal'
import PageHeader from './PageHeader'

/**
 * Types
 */
interface Props {
  initialized: boolean
  children: ReactNode | ReactNode[]
}

/**
 * Container
 */
export default function Layout({ children, initialized }: Props) {
  const {
    signerAddress,
    address
  } = useContext(WalletContext);
  useEffect(() => {
    if (!initialized) {
      return
    }
    (async () => {
      await Promise.all(signClient?.pairing?.values.map(v => {
        return signClient.core.pairing.activate({ topic: v.topic })
      }));
    })();
  }, [initialized])
  return (
    <>
      {initialized ? (
        <Fragment>
          <RouteTransition>
            <Card.Body
              css={{
                display: 'block',
              }}
            >
              <PageHeader title={`PKP: ${address}`}>
                <p className='btn btn-xs' >
                  <Link target="_blank" href={`https://mumbai.polygonscan.com/address/${address}`}>Explorer</Link>
                </p>              
              </PageHeader>
              <PageHeader title={`Connected wallet: ${signerAddress}`}>
                <p className='btn btn-xs' >
                  <Link target="_blank" href={`https://mumbai.polygonscan.com/address/${signerAddress}`}>Explorer</Link>
                </p>
              </PageHeader>
              {children}
            </Card.Body>
          </RouteTransition>

          <Card.Footer
            css={{
              height: '85px',
              minHeight: '85px',
              position: 'sticky',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              backgroundColor: '#111111',
              zIndex: 200,
              bottom: 0,
              left: 0
            }}
          >            
            <Navigation />
          </Card.Footer>
        </Fragment>
      ) : (
        <Loading />
      )}
      <Modal />
    </>
  )
}
