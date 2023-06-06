import { LitContracts } from '@lit-protocol/contracts-sdk'
import * as LitJsSdk from '@lit-protocol/lit-node-client'
import { ethers, Signer } from 'ethers'
import { useRouter } from 'next/router'
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import base58 from 'bs58'
import { gnosis } from '@/abis/gnosis'
import { litNetwork } from '@/constants'
import { IEIP155Lib } from '@/lib/EIP155Lib'
import { restorePkpWallet } from '@/walletconnect/utils/EIP155WalletUtil'
import { useAccount, useConnect, useDisconnect, useNetwork, useSigner } from 'wagmi'
import { InjectedConnector } from '@wagmi/connectors/injected'
import { trpc } from '@/utils/trpc'

const litContracts = new LitContracts()
const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: litNetwork })

export type Action = {
  id: string
  cid: string
}
export type WalletStandalone = {
  pkpId: string
  pkpAddress: string
  pkpPublicKey: string
  signer: Signer | null
  signerAddress: string
  owner: string
  actions: Action[]
  chainId: number | null
  litContracts: LitContracts
  litNodeClient: any
  pkpWallet: IEIP155Lib | null
}
export const WalletContext = createContext<WalletStandalone>({
  pkpId: '',
  pkpAddress: '',
  pkpPublicKey: '',
  signer: null,
  signerAddress: '',
  owner: '',
  actions: [],
  chainId: null,
  litContracts,
  litNodeClient,
  pkpWallet: null
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

export default function WalletStandaloneContext({ children }: Props) {
  const { chain, chains } = useNetwork()
  const { address: signerAddress } = useAccount()
  const { data: signer } = useSigner()
  const { connect } = useConnect({
    connector: new InjectedConnector()
  })
  const { disconnect } = useDisconnect()

  const router = useRouter()

  const restoredPkpQuery = trpc.actions.restorePkp.useQuery(
    { pkpId: router.query.pkp as string },
    {
      enabled: !!router.query.pkp
    }
  )
  // console.log('restoredPkpQuery', restoredPkpQuery.data)
  // const [address, setAddress] = useState('')
  // const [publicKey, setPublicKey] = useState('')
  // const [pkp, setPkp] = useState('')
  // const [signer, setSigner] = useState<Signer | null>(null)
  // const [signerAddress, setSignerAddress] = useState('')
  // const [owner, setOwner] = useState('')
  // const [actions, setActions] = useState<string[]>([])
  // const [chainId, setChainId] = useState<number | null>(null)
  const [pkpWallet, setPkpWallet] = useState<IEIP155Lib | null>(null)

  const reload = useCallback(() => {
    if (!router.query || !connect) {
      return
    }
    const clear = () => {
      //not needed since it's automatically cleared from the router query state
      // setAddress('')
      // setPublicKey('')
      // setPkp('')
    }
    ;(async () => {
      // const contract = new ethers.Contract(safe, gnosis.abi, provider)
      // setSigners(await contract.getOwners())
      // setThreshold((await contract.getThreshold()).toNumber())

      const pkp = router.query.pkp as string
      // console.log('pkp!', pkp)
      if (!pkp || !restoredPkpQuery.data) {
        // console.log('no pkp or signer or restoredPkpQuery.data', {
        //   pkp,
        //   data: restoredPkpQuery.data,
        //   signer
        // })
        clear()
        return
      }
      if (!signer) {
        await connect()
        return
      }

      try {
        console.log('connecting...')
        await connect()
        // await litContracts.connect()
        console.log('connected!!!!')
        // const publicKey = await litContracts.pkpNftContract.read.getPubkey(pkp)
        // console.log('publicKey', publicKey)
        // setPublicKey(publicKey)
        // const addressPkp = ethers.utils.computeAddress(publicKey)
        // setAddress(addressPkp)
        // setPkp(pkp as string)
        // setSigner(litContracts.signer)
        const wallet = await restorePkpWallet(signer, {
          pkpId: restoredPkpQuery.data.pkpId,
          publicKey: restoredPkpQuery.data.pkpPublicKey,
          pkpAddress: restoredPkpQuery.data.pkpAddress
        })

        console.log('pkp wallet is ', wallet)
        setPkpWallet(wallet.eip155Wallets[wallet.eip155Addresses[0]])

        // setChainId(await signer.getChainId())
        // console.log('signer', litContracts.signer)
        // await Promise.all([
        //   // (async () => setSignerAddress(await litContracts.signer.getAddress()))(),
        //   (async () => {
        //     // console.log('fetching owner')
        //     const owner = await litContracts.pkpNftContract.read.ownerOf(pkp)
        //     // console.log('fetched owner', owner)
        //     setOwner(owner)
        //   })(),
        //   (async () =>
        //     setActions(
        //       await litContracts.pkpPermissionsContractUtil.read.getPermittedActions(pkp)
        //     ))(),
        //   (async () => setChainId((await litContracts.provider.getNetwork()).chainId))()
        // ])

        // console.log('all done with wallet context!', {
        //   pkp,
        //   publicKey: restoredPkpQuery.data?.pkpPublicKey,
        //   address: restoredPkpQuery.data?.pkpAddress,
        //   signer: signer,
        //   signerAddress,
        //   owner: restoredPkpQuery.data?.owner,
        //   actions: restoredPkpQuery.data?.permittedActions,
        //   chainId,
        //   pkpWallet
        // })
      } catch (err) {
        console.error(err)
        clear()
      }
    })()
  }, [router, signer, restoredPkpQuery.data, signerAddress])

  useEffect(() => {
    reload()
    document.addEventListener('reload', reload)
    return () => document.removeEventListener('reload', reload)
  }, [reload])

  const wallet: WalletStandalone = useMemo(() => {
    return {
      pkpAddress: restoredPkpQuery.data?.pkpAddress || '',
      pkpId: restoredPkpQuery.data?.pkpId || '',
      pkpPublicKey: restoredPkpQuery.data?.pkpPublicKey || '',
      signer: signer || null,
      signerAddress: signerAddress || '',
      owner: restoredPkpQuery.data?.owner || '',
      actions: restoredPkpQuery.data?.permittedActions || [],
      chainId: chain?.id || null,
      litContracts,
      litNodeClient,
      pkpWallet
    }
  }, [
    restoredPkpQuery.data?.pkpAddress,
    restoredPkpQuery.data?.pkpId,
    restoredPkpQuery.data?.pkpPublicKey,
    signer,
    signerAddress,
    restoredPkpQuery.data?.owner,
    restoredPkpQuery.data?.permittedActions,
    chain?.id,
    litContracts,
    litNodeClient,
    pkpWallet
  ])

  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
}
