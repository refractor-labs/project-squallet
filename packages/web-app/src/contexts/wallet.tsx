import { LitContracts } from "@lit-protocol/contracts-sdk";
import LitJsSdk from 'lit-js-sdk'
import { ethers, Signer } from "ethers";
import { useRouter } from "next/router";
import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import base58 from "bs58";

const litContracts = new LitContracts();
const litNodeClient = new (LitJsSdk as any).LitNodeClient({ litNetwork: 'serrano' })

export type Action = {
  id: string;
  cid: string;
}
export type Wallet = {
  pkp: string;
  address: string;
  publicKey: string;
  signer: Signer | null;
  signerAddress: string;
  owner: string;
  actions: Action[];
  chainId: string;
  litContracts: LitContracts;
  litNodeClient: any;
}
export const WalletContext = createContext<Wallet>({
  pkp: '',
  address: '',
  publicKey: '',
  signer: null,
  signerAddress: '',
  owner: '',
  actions: [],
  chainId: '',
  litContracts,
  litNodeClient,
});

type Props = {
  children: ReactNode;
}

const fromHexString = (hexString: string) =>
  Uint8Array.from((hexString.match(/.{1,2}/g) as any).map((byte: string) => parseInt(byte, 16)))

const hexToString = (hex: string): string => {
  const hashStr = base58.encode(fromHexString(hex.slice(2)))
  return hashStr
}

export default function({children}: Props) {
  const [address, setAddress] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [pkp, setPkp] = useState('');
  const [signer, setSigner] = useState<Signer | null>(null);
  const [signerAddress, setSignerAddress] = useState('');
  const [owner, setOwner] = useState('');
  const [actions, setActions] = useState<string[]>([])
  const [chainId, setChainId] = useState('');

  const router = useRouter();

  const reload = useCallback(() => {
    if (!router.query) {
      return
    }
    console.log(router.query)
    const clear = () => {
      setAddress('');
      setPublicKey('');
      setPkp('')
    }
    (async () => {
      const pkp = router.query.pkp as string
      if (!pkp) {
        clear();
        return
      }
      try {
        await litContracts.connect()
        const publicKey = await litContracts.pkpNftContract.read.getPubkey(pkp)
        console.log(publicKey);
        setPublicKey(publicKey)
        setAddress(ethers.utils.computeAddress(publicKey))
        setPkp(pkp as string)
        setSigner(litContracts.signer);
        setSignerAddress(await litContracts.signer.getAddress())
        setOwner(await litContracts.pkpNftContract.read.ownerOf(pkp))
        setActions(await litContracts.pkpPermissionsContractUtil.read.getPermittedActions(pkp));
        setChainId((await litContracts.provider.getNetwork()).chainId);
      } catch(err) {
        console.error(err)
        clear();
      }
    })();
  }, [router])

  useEffect(() => {
    reload()
    document.addEventListener('reload', reload);
    return () => document.removeEventListener('reload', reload);
  }, [reload]);

  return (
    <WalletContext.Provider value={{
        address, 
        pkp, 
        publicKey, 
        signer,
        signerAddress,
        owner,
        actions: actions.map(a => ({
          id: a,
          cid: hexToString(a),
        })),
        chainId,
        litContracts,
        litNodeClient,
      }}>
      {children}
    </WalletContext.Provider>
  )
}
