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

type Props = {
  transaction: TransactionDetailed
  onUpdate: () => void
  baseNonce: number
  nonce: number
}

function Transaction({ transaction, onUpdate, baseNonce, nonce }: Props) {
  const [loading, setLoading] = useState(false)
  const {
    // actions,
    pkpAddress,
    signer,
    // signers,
    // threshhold,
    signerAddress,
    litNodeClient,
    pkpPublicKey,
    litContracts,
    pkpWallet
  } = useWalletContext()
  const msConfig = useActiveAction()

  const { safeApi } = useApi()

  const safe = pkpAddress

  if (!transaction || !transaction.transaction || !pkpAddress || !msConfig.data) {
    return null
  }

  const tx = {
    ...transaction.transaction,
    nonce
  }
  const hash = ethers.utils.keccak256(ethers.utils.serializeTransaction(tx))

  const sign = async () => {
    if (!signer || !safeApi) {
      return
    }

    // pkpWallet.
    try {
      const signature = await signer.signMessage(hash)
      await safeApi.createSignature(pkpAddress, transaction.id, signature, signerAddress, nonce)
      await onUpdate()
    } catch {}
  }

  const broadcast = async () => {
    if (!transaction?.transaction || !msConfig.data) {
      return
    }
    setLoading(true)
    try {
      var authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: chainLit })
      await litNodeClient.connect()
      // this does both deployment action calling in the same code
      // need to break it down to upload to ipfs separately

      // pkpWallet.pkpWallet
      const resp = await litNodeClient.executeJs({
        ipfsId: msConfig.data.action.cid, //todo, more intelligently pick the action
        authSig,
        // all jsParams can be used anywhere in your litActionCode
        jsParams: {
          tx,
          threshold: msConfig.data.threshold,
          rpc: 'https://ethereum.publicnode.com',
          network: 'homestead',
          pkpPublicKey: publicKey,
          sigName: 'sig1',
          signatures: transaction.signatures.map(s => s.signature)
        }
      })
      // console.log(resp)
      if (!resp?.signatures?.sig1) {
        alert('Invalid signature')
        setLoading(false)
        return
      }
      const serialized2 = ethers.utils.serializeTransaction(tx, resp.signatures.sig1.signature)
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
    setLoading(false)
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
        {msConfig.data[0].signers.map((signer, index) => {
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
