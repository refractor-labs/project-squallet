import { Fragment, useContext, useEffect } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Fund from '../fund'
import LitAction from '../lit-action'
import useInitialization from '@/walletconnect/hooks/useInitialization'
import useWalletConnectEventsManager from '@/walletconnect/hooks/useWalletConnectEventsManager'
import Layout from '@/walletconnect/components/Layout'
import { useRouter } from 'next/router'
import { WalletContext } from '@/contexts/wallet-standalone'
import { SelectChain } from '../SelectChain'

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
}
const navigation = [
  { name: 'Home', href: '#', current: true },
  { name: 'Transactions', href: '#', current: false }
]
const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' }
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
type Props = { children: React.ReactNode }
export default function DashboardLayout({ children }: Props) {
  const wallet = useContext(WalletContext)
  console.log('Dashboard wallet:', wallet)
  const initialized = useInitialization(wallet)
  const router = useRouter()
  useWalletConnectEventsManager(initialized)

  useEffect(() => {
    const c = () => {
      const elem = document.getElementById('lit-connect-modal')
      if (elem) {
        if (elem.classList.contains('is-open')) {
          elem.classList.add('modal-open')
        } else if (elem.classList.contains('modal-open')) {
          elem.classList.remove('modal-open')
        }
      }
    }
    const interval = setInterval(c, 1000)
    return () => clearInterval(interval)
  }, [])

  // if (router.asPath.indexOf('/pkp/') !== -1 && !wallet.pkp) {
  //   return null
  // }

  // console.log('initialized', initialized)
  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-100">
        <body class="h-full">
        ```
      */}
      <div className="min-h-full">
        <main>
          <div className="mx-auto max-w-4xl py-6">
            <SelectChain />
            {router.asPath.indexOf('/pkp/') !== -1 ? (
              <div className="card bg-base-100 w-full max-w-full shadow-xl border break-all divide-y gap-6">
                <div className="card-body min-h-screen">
                  {initialized && <Layout initialized>{children}</Layout>}
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </>
  )
}
