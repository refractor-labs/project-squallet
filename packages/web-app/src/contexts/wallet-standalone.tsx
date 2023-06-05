import { LitContracts } from '@lit-protocol/contracts-sdk'
import * as LitJsSdk from '@lit-protocol/lit-node-client'
import { ethers, Signer } from 'ethers'
import { useRouter } from 'next/router'
import { createContext, ReactNode, useCallback, useEffect, useState } from 'react'
import base58 from 'bs58'
import { gnosis } from '@/abis/gnosis'
import { litNetwork } from '@/constants'

const litContracts = new LitContracts()
const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: litNetwork })

export type Action = {
  id: string
  cid: string
}
export type WalletStandalone = {
  pkp: string
  address: string
  publicKey: string
  signer: Signer | null
  signerAddress: string
  owner: string
  actions: Action[]
  chainId: string
  litContracts: LitContracts
  litNodeClient: any
}
export const WalletContextStandalone = createContext<WalletStandalone>({
  pkp: '',
  address: '',
  publicKey: '',
  signer: null,
  signerAddress: '',
  owner: '',
  actions: [],
  chainId: '',
  litContracts,
  litNodeClient
})

type Props = {
  children: ReactNode
}

const fromHexString = (hexString: string) =>
  Uint8Array.from((hexString.match(/.{1,2}/g) as any).map((byte: string) => parseInt(byte, 16)))

const hexToString = (hex: string): string => {
  const hashStr = base58.encode(fromHexString(hex.slice(2)))
  return hashStr
}

// const rpc = 'https://eth-mainnet.g.alchemy.com/v2/_G2nJ6rJsA4hR3q0BotWHVLoK40HF4FA'
// const rpc = 'https://chain-rpc.litprotocol.com/http'
// const network = 'chronicle'
// const provider = new ethers.providers.JsonRpcProvider(rpc, network)

export default function ({ children }: Props) {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [pkp, setPkp] = useState('')
  const [signer, setSigner] = useState<Signer | null>(null)
  const [signerAddress, setSignerAddress] = useState('')
  const [owner, setOwner] = useState('')
  const [actions, setActions] = useState<string[]>([])
  const [chainId, setChainId] = useState('')

  const reload = useCallback(() => {
    if (!router.query) {
      return
    }
    const clear = () => {
      setAddress('')
      setPublicKey('')
      setPkp('')
    }
    ;(async () => {
      // const contract = new ethers.Contract(safe, gnosis.abi, provider)
      // setSigners(await contract.getOwners())
      // setThreshold((await contract.getThreshold()).toNumber())

      const pkp = router.query.pkp as string
      console.log('pkp!', pkp)
      if (!pkp) {
        clear()
        return
      }
      try {
        console.log('connecting...')
        await litContracts.connect()
        console.log('connected!!!!')
        const publicKey = await litContracts.pkpNftContract.read.getPubkey(pkp)
        console.log('publicKey', publicKey)
        setPublicKey(publicKey)
        setAddress(ethers.utils.computeAddress(publicKey))
        setPkp(pkp as string)
        setSigner(litContracts.signer)
        console.log('signer', litContracts.signer)
        await Promise.all([
          async () => setSignerAddress(await litContracts.signer.getAddress()),
          async () => setOwner(await litContracts.pkpNftContract.read.ownerOf(pkp)),
          async () =>
            setActions(await litContracts.pkpPermissionsContractUtil.read.getPermittedActions(pkp)),
          async () => setChainId((await litContracts.provider.getNetwork()).chainId)
        ])
        console.log('all done with wallet context!', {
          pkp,
          publicKey,
          address,
          signer,
          signerAddress,
          owner,
          actions,
          chainId
        })
      } catch (err) {
        console.error(err)
        clear()
      }
    })()
  }, [router])

  useEffect(() => {
    reload()
    document.addEventListener('reload', reload)
    return () => document.removeEventListener('reload', reload)
  }, [reload])

  return (
    <WalletContextStandalone.Provider
      value={{
        address,
        pkp,
        publicKey,
        signer,
        signerAddress,
        owner,
        actions: actions.map(a => ({
          id: a,
          cid: hexToString(a)
        })),
        chainId,
        litContracts,
        litNodeClient
      }}
    >
      {children}
    </WalletContextStandalone.Provider>
  )
}
