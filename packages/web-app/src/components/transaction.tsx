import { useWalletContext, WalletContext } from '@/contexts/wallet-standalone'
import useApi from '@/hooks/useApi'
import { TransactionDetailed } from '@refactor-labs-lit-protocol/api-client'
import { ethers } from 'ethers'
import { useCallback, useContext, useEffect, useState } from 'react'
import * as LitJsSdk from '@lit-protocol/lit-node-client'

import { signClient } from '@/walletconnect/utils/WalletConnectUtil'
import { formatJsonRpcResult } from '@json-rpc-tools/utils'
import ModalStore from '@/walletconnect/store/ModalStore'
import { Text } from '@nextui-org/react'
import { chainLit } from '@/constants'
import { useLitActionSource } from '@/hooks/lit-action/useLitActionSource'
import { useActiveAction, useMultisigConfig } from '@/hooks/lit-action/useMultisigConfig'
import { useMutation } from '@tanstack/react-query'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import { useLitClient } from '@/hooks/lit-action/useLitClient'
import {
  SignTransactionRequest,
  TransactionRequestI,
  UnsignedMpcTransaction
} from '@refactor-labs-lit-protocol/litlib'
import { useWalletClient } from '@/hooks/lit-action/useWalletClient'

const chainIdToLitChainName = (chainId: number) => {
  switch (chainId) {
    case 1:
      return 'mainnet'
    case 4:
      return 'rinkeby'
    case 5:
      return 'goerli'
    case 80001:
      return 'mumbai'
    case 175177:
      return 'chronicle'
  }
  throw new Error('unknown chain id: ' + chainId)
}

type Props = {
  transaction: TransactionDetailed
  onUpdate: () => void
  baseNonce: number
  nonce: number
}

function Transaction({ transaction, onUpdate, baseNonce, nonce }: Props) {
  // const [loading, setLoading] = useState(false)
  const {
    // actions,
    pkpAddress,
    signer,
    // signers,
    // threshhold,
    signerAddress,
    // litNodeClient,
    pkpPublicKey,
    litContracts,
    pkpWallet
  } = useWalletContext()
  const { data: walletClient } = useWalletClient()
  const { data: litNodeClient } = useLitClient()

  const { chain } = useNetwork()
  const { error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
  const msConfig = useActiveAction()

  const { safeApi } = useApi()

  const safe = pkpAddress

  const tx = {
    ...transaction.transaction,
    nonce
  }

  let chainMismatch = false
  const txChain = transaction.transaction?.chainId as string | undefined
  if (typeof chain?.id !== 'number' || txChain !== chain?.id?.toString()) {
    chainMismatch = true
  }

  const hash = ethers.utils.keccak256(ethers.utils.serializeTransaction(tx))

  const sign = async () => {
    if (!signer || !safeApi || !chain?.id || !txChain) {
      return
    }
    if (chainMismatch) {
      console.log('chain mismatch', txChain, 'actual', chain?.id)
      switchNetwork?.(parseInt(txChain))
      return
      //request to switch network
    }
    //switch the network to the correct one

    // pkpWallet.
    try {
      //todo use walletClient for this
      const signature = await signer.signMessage(hash)
      await safeApi.createSignature(pkpAddress, transaction.id, signature, signerAddress, nonce)
      await onUpdate()
    } catch {}
  }

  const { mutate: broadcastMutation, isLoading: loading } = useMutation(async () => {
    if (
      !transaction?.transaction ||
      !msConfig.data ||
      !txChain ||
      !litNodeClient ||
      !walletClient
    ) {
      return
    }
    if (chainMismatch) {
      console.log('chain mismatch', txChain, 'actual', chain?.id)
      switchNetwork?.(parseInt(txChain))
      return
      //request to switch network
    }
    // setLoading(true)
    console.log('chain is', chain)
    try {
      var authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: chainIdToLitChainName(chain?.id as number)
      })

      console.log('got the auth sig!!!!!', authSig)
      await litNodeClient.connect()
      console.log('connected!')
      // this does both deployment action calling in the same code
      // need to break it down to upload to ipfs separately

      // pkpWallet.pkpWallet
      const request: SignTransactionRequest = {
        method: 'signTransaction',
        request: {
          signedTransaction: {
            transaction: transaction.transaction as UnsignedMpcTransaction,
            signatures: transaction.signatures.map(s => ({
              signerAddress: ethers.utils.getAddress(s.signer),
              signature: s.signature
            })),
            hash: transaction.hash as string,
            walletAddress: ethers.utils.getAddress(transaction.address)
          },
          transaction: transaction.transaction as TransactionRequestI
        }
      }
      const resp = await walletClient.sendRequest(request)
      // const resp = await litNodeClient.executeJs({
      //   ipfsId: msConfig.data.action.cid,
      //   authSig,
      //   // all jsParams can be used anywhere in your litActionCode
      //   jsParams: {
      //     tx,
      //     rpc: 'https://ethereum.publicnode.com',
      //     network: 'homestead',
      //     pkpPublicKey,
      //     sigName: 'sig1',
      //     signatures: transaction.signatures.map(s => s.signature)
      //   }
      // })

      console.log(resp)
      if (!resp.data?.signatures?.sig1) {
        alert('Invalid signature')
        // setLoading(false)
        return
      }
      const serialized2 = ethers.utils.serializeTransaction(tx, resp.data.signatures.sig1.signature)
      // console.log(serialized2)
      const sent = await litContracts.provider.sendTransaction(serialized2)
      await sent.wait()
      await safeApi.patchTransaction(pkpAddress, transaction.id, sent.hash)
      await onUpdate()
      if (transaction.topic && transaction.requestId) {
        try {
          await signClient.respond({
            topic: transaction.topic,
            response: formatJsonRpcResult(parseInt(transaction.requestId, 10), sent.hash)
          })
        } catch (err: any) {
          console.log(err)
        }
      }
    } catch (err) {
      console.log(err)
      alert('See console for error')
    }
    // setLoading(false)
  })

  const broadcast = useCallback(() => {
    broadcastMutation()
  }, [broadcastMutation])

  if (!transaction || !transaction.transaction || !pkpAddress || !msConfig.data) {
    // console.log('hey hey hey, null!!', { transaction, pkpAddress, msConfig })
    return null
  }

  const deleteTransaction = async () => {
    if (!transaction?.id) {
      return
    }
    await safeApi.deleteTransaction(safe, transaction.id)
    await onUpdate()
  }

  return (
    <div className="py-6 text-xs">
      <span>{transaction.hash}</span>
      <div className="mockup-code">
        <pre className="px-4">
          <code>
            {`
${JSON.stringify(tx, null, 2)}              
              `}
          </code>
        </pre>
      </div>
      <div className="space-y-4 py-4 text-xs">
        {msConfig.data.signers.map((signer, index) => {
          const isSigner = signerAddress.toLocaleLowerCase() === signer.toLocaleLowerCase()
          const signature = transaction.signatures?.find(
            signature => signature.signer.toLocaleLowerCase() === signer.toLocaleLowerCase()
          )
          if (signature && signature.nonce === nonce) {
            return (
              <div key={'signer' + index} className="border p-4 rounded-xl">
                Signer: {signer}
                <br />
                Signature: {signature.signature}
              </div>
            )
          }
          return (
            <div key={'signer' + index} className="border p-4 rounded-xl">
              Signer: {signer}
              <br />
              Signature:{' '}
              <button className="btn btn-xs" onClick={sign} disabled={!isSigner}>
                Sign
              </button>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={broadcast}
          className={`btn w-full btn-success ${loading ? ' loading ' : ''}`}
          disabled={
            transaction.signatures.length < msConfig.data.threshold ||
            loading ||
            baseNonce !== nonce ||
            transaction.signatures.some(signature => {
              return signature.nonce !== nonce
            })
          }
        >
          Broadcast
        </button>
        <button
          onClick={deleteTransaction}
          className={`btn btn-error w-full ${loading ? ' loading ' : ''}`}
          disabled={loading}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default Transaction
