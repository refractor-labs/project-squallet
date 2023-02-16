import { EIP155PkpLib, IEIP155Lib } from '@/lib/EIP155Lib'
import { Signer } from 'ethers'
import { LitWalletData } from '@/lib/lit/LitMpcWallet'
import { useLocalStorage } from 'usehooks-ts'

export let wallet1: IEIP155Lib
export let wallet2: IEIP155Lib
export let eip155Wallets: Record<string, IEIP155Lib>
export let eip155Addresses: string[]

let address1: string

/**
 * Utilities
 */

export async function restorePkpWallet(
  eoaSigner: Signer,
  { publicKey, pkpId, pkpAddress }: { publicKey: string; pkpId: string; pkpAddress: string }
) {
  // const pkpAddress = window.localStorage.getItem('address')
  // const publicKey = window.localStorage.getItem('publicKey')
  // const pkpId = window.localStorage.getItem('pkpId')
  if (!pkpAddress || !publicKey || !pkpId) throw new Error('Missing PKP env vars')
  const wallet: LitWalletData = {
    pkpAddress,
    publicKey,
    pkpId
  }

  wallet1 = await EIP155PkpLib.init({
    eoaSigner,
    wallet
  })
  console.log('wallet1', wallet1)
  address1 = await wallet1.getAddress()

  eip155Wallets = {
    [address1]: wallet1
  }
  eip155Addresses = Object.keys(eip155Wallets)

  console.log('finished init wallets')
  return {
    eip155Wallets,
    eip155Addresses
  }
}
