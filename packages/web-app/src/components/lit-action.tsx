import { ipfs } from '@/utils/ipfs'
import { useContext, useState } from 'react'
import { ethers } from 'ethers'
import * as LitJsSdk from '@lit-protocol/lit-node-client'
import { WalletContext } from '@/contexts/wallet'
import { useRouter } from 'next/router'
import { getCode } from '@/utils/code'
import { gnosis } from '@/abis/gnosis'
import { litNetworkChainName } from '@/constants'

export default function LitAction() {
  const { publicKey, address, pkp, owner, actions, chainId, litContracts, litNodeClient } =
    useContext(WalletContext)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const safe = (router.query.safe || '0x7169C30D4cfb727C7A463dA8c33A18B8f11C2230') as string

  const onClickDelete = async (id: string) => {
    if (!actions?.length || actions.length === 1) {
      alert('Please do not delete the only action left')
      return
    }
    if (!confirm('Are you sure you want to delete this action?')) {
      return
    }
    await litContracts.connect()
    await litNodeClient.connect()

    const params = [pkp, id, []]

    const estimation = await litContracts.pkpPermissionsContract.write
      .connect(address)
      .estimateGas.removePermittedAction(...params)
    const feeData = await litContracts.provider.getFeeData()
    const nonce = await litContracts.provider.getTransactionCount(address)
    const tx = await litContracts.pkpPermissionsContract.write
      .connect(address)
      .populateTransaction.removePermittedAction(...params)
    tx.type = 2
    tx.nonce = nonce
    tx.chainId = chainId
    tx.maxFeePerGas = feeData.maxFeePerGas.toHexString()
    tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas.toHexString()
    tx.gasLimit = estimation.toHexString()

    // get authentication signature to deploy call the action
    var authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: litNetworkChainName })

    // this does both deployment action calling in the same code
    // need to break it down to upload to ipfs separately
    const resp = await litNodeClient.executeJs({
      ipfsId: actions[actions.length - 1].cid,
      authSig,
      // all jsParams can be used anywhere in your litActionCode
      jsParams: {
        tx,
        publicKey,
        sigName: 'sig1'
      }
    })
    console.log(resp)
    const serialized2 = ethers.utils.serializeTransaction(tx, resp.signatures.sig1.signature)
    console.log(serialized2)
    const sent = await litContracts.provider.sendTransaction(serialized2)
    console.log(sent)
    console.log(await sent.wait())
    document.dispatchEvent(new Event('reload'))
  }
  const onClickCreate = async () => {
    setLoading(true)
    try {
      await litContracts.connect()
      await litNodeClient.connect()

      const ipfsResp = await ipfs.add(getCode(safe))
      const newCid = ipfsResp.cid
      const signer = await litContracts.signer.getAddress()
      const { chainId } = await litContracts.provider.getNetwork()
      if (owner === address) {
        const params = [pkp, newCid.bytes, []]
        console.log(newCid)

        const estimation = await litContracts.pkpPermissionsContract.write
          .connect(address)
          .estimateGas.addPermittedAction(...params)
        const feeData = await litContracts.provider.getFeeData()
        const nonce = await litContracts.provider.getTransactionCount(address)
        const tx = await litContracts.pkpPermissionsContract.write
          .connect(address)
          .populateTransaction.addPermittedAction(...params)
        tx.type = 2
        tx.nonce = nonce
        tx.chainId = chainId
        tx.maxFeePerGas = feeData.maxFeePerGas.toHexString()
        tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas.toHexString()
        tx.gasLimit = estimation.toHexString()
        // get authentication signature to deploy call the action
        var authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: litNetworkChainName })

        console.log({
          ipfsId: actions[actions.length - 1].cid,
          authSig,
          // all jsParams can be used anywhere in your litActionCode
          jsParams: {
            tx,
            rpc: 'https://eth-mainnet.g.alchemy.com/v2/_G2nJ6rJsA4hR3q0BotWHVLoK40HF4FA',
            network: 'homestead',
            publicKey,
            sigName: 'sig1'
          }
        })
        // this does both deployment action calling in the same code
        // need to break it down to upload to ipfs separately
        const resp = await litNodeClient.executeJs({
          ipfsId: actions[actions.length - 1].cid,
          authSig,
          // all jsParams can be used anywhere in your litActionCode
          jsParams: {
            tx,
            rpc: 'https://eth-mainnet.g.alchemy.com/v2/_G2nJ6rJsA4hR3q0BotWHVLoK40HF4FA',
            publicKey,
            sigName: 'sig1'
          }
        })
        console.log(resp)
        const serialized2 = ethers.utils.serializeTransaction(tx, resp.signatures.sig1.signature)
        console.log(serialized2)
        const sent = await litContracts.provider.sendTransaction(serialized2)
        console.log(sent)
        console.log(await sent.wait())
      } else {
        await litContracts.pkpPermissionsContractUtil.write.addPermittedAction(
          pkp,
          newCid.toString()
        )
        const transferTx = await litContracts.pkpNftContract.write.transferFrom(
          signer,
          address,
          pkp
        )
        await transferTx.wait()
      }
      document.dispatchEvent(new Event('reload'))
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  if (!owner || !address) {
    return null
  }
  return (
    <div className="text-xs space-y-6">
      <h3 className="font-bold">PKP Owner:</h3>
      <span>{owner}</span>
      <span className="badge badge-sm font-xs ml-3">{owner === address ? 'PKP' : 'Non-PKP'} </span>
      <h3 className="font-bold">Approved Actions:</h3>
      <span className="space-y-3">
        {actions?.map(a => {
          return (
            <p key={a.id} className="space-x-2">
              <a
                href={`https://ipfs.stibits.com/${a.cid}`}
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                {a.cid}
              </a>
              <button onClick={() => onClickDelete(a.id)} className="btn btn-xs btn-ghost text-xs">
                x
              </button>
            </p>
          )
        })}
      </span>
      {owner !== address && (
        <div className="card-actions justify-end">
          <button className={`btn btn-sm ${loading ? 'loading' : ''}`} onClick={onClickCreate}>
            {owner === address ? 'Update Signers' : 'Transfer Onwership to PKP'}
          </button>
        </div>
      )}
    </div>
  )
}
