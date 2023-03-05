import { LitContracts } from "@lit-protocol/contracts-sdk";
import LitJsSdk from 'lit-js-sdk'
import { ethers, Signer } from "ethers";
import { useRouter } from "next/router";
import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import base58 from "bs58";
import { gnosis } from "@/abis/gnosis";

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
  safe: string;
  signers: string[];
  threshhold: number;
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
  safe: '',
  signers: [],
  threshhold: 0,
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

const rpc = "https://eth-mainnet.g.alchemy.com/v2/_G2nJ6rJsA4hR3q0BotWHVLoK40HF4FA";
const network = "homestead";
const provider = new ethers.providers.JsonRpcProvider(rpc, network);

export default function({children}: Props) {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [pkp, setPkp] = useState('');
  const [signer, setSigner] = useState<Signer | null>(null);
  const [signerAddress, setSignerAddress] = useState('');
  const [owner, setOwner] = useState('');
  const [actions, setActions] = useState<string[]>([])
  const [chainId, setChainId] = useState('');
  const [safe, setSafe] = useState('');
  const [threshhold, setThreshold] = useState(0);
  const [signers, setSigners] = useState<string[]>([]);


  const reload = useCallback(() => {
    if (!router.query) {
      return
    }
    const clear = () => {
      setAddress('');
      setPublicKey('');
      setPkp('')
      setSafe('');
    }
    (async () => {
      const safe = router.query.safe as string;
      if (!safe) {
        clear();
        return;
      }
      setSafe(safe);
      const contract = new ethers.Contract(safe , gnosis.abi , provider);
      setSigners(await contract.getOwners());
      setThreshold((await contract.getThreshold()).toNumber())

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
        safe,
        actions: actions.map(a => ({
          id: a,
          cid: hexToString(a),
        })),
        chainId,
        litContracts,
        litNodeClient,
        signers,
        threshhold,
      }}>
      {children}
    </WalletContext.Provider>
  )
}
