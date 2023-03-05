import { WalletContext } from "@/contexts/wallet";
import useApi from "@/hooks/useApi";
import { TransactionDetailed } from "@refactor-labs-lit-protocol/api-client";
import { ethers } from "ethers";
import { useContext, useState } from "react";
import LitJsSdk from 'lit-js-sdk';

type Props = {
  transaction: TransactionDetailed
  onUpdate: () => void,
}

function Transaction ({transaction, onUpdate}: Props) {
  const [loading, setLoading] = useState(false);
  const { actions, signer, signers, threshhold, signerAddress, safe, litNodeClient, publicKey, litContracts } = useContext(WalletContext);

  const { safeApi } = useApi();

  if (!transaction || !transaction.transaction || !signers) {
    return null
  }
  const hash = ethers.utils.keccak256(ethers.utils.serializeTransaction(transaction.transaction));

  const sign = async () => {
    if (!signer || !safeApi) {
      return
    }
    try {
      const signature = await signer.signMessage(hash)
      await safeApi.createSignature(safe, transaction.id, signature, signerAddress)
      await onUpdate();
    } catch{}
  }

  const broadcast = async () => {
    if (!transaction?.transaction) {
      return
    }
    setLoading(true);
    try {
      var authSig = await (LitJsSdk as any).checkAndSignAuthMessage({ chain: 'mumbai' })
      await litNodeClient.connect();
      // this does both deployment action calling in the same code
      // need to break it down to upload to ipfs separately
      const resp = await litNodeClient.executeJs({
        ipfsId: actions[0].cid,
        authSig,
        // all jsParams can be used anywhere in your litActionCode
        jsParams: {
          tx: transaction.transaction,
          threshhold,
          rpc: 'https://ethereum.publicnode.com',
          network: 'homestead',
          publicKey,
          sigName: 'sig1',
          signatures: transaction.signatures.map(s => s.signature),
        }
      })      
      console.log(resp)
      if (!resp?.signatures?.sig1) {
        alert("Invalid signature");
        setLoading(false);
        return
      }
      const serialized2 = ethers.utils.serializeTransaction(transaction.transaction, resp.signatures.sig1.signature)
      console.log(serialized2)
      const sent = await litContracts.provider.sendTransaction(serialized2)
      await safeApi.patchTransaction(safe, transaction.id, sent.hash);
      await onUpdate();
    } catch(err) {
      console.log(err);
      alert('See console for error');
    }
    setLoading(false);
  }

  const deleteTransaction = async () => {
    if (!transaction?.id) {
      return
    }
    await safeApi.deleteTransaction(safe, transaction.id);
    await onUpdate();
  }

  return (
    <div className="py-6 text-xs">
      <div className="mockup-code">
        <pre className="px-4">
          <code>
            {
              `
${JSON.stringify(transaction.transaction, null, 2)}              
              `
            }
          </code>
        </pre>
      </div>
      <div className="space-y-4 py-4 text-xs">
        {
          signers.map(signer => {
            const isSigner = signerAddress.toLocaleLowerCase() === signer.toLocaleLowerCase();
            const signature = transaction.signatures?.find(signature => signature.signer.toLocaleLowerCase() === signer.toLocaleLowerCase());
            if (signature) {
              return (
                <div className="border p-4 rounded-xl">
                  Signer: {signer}<br />
                  Signature: {signature.signature}
                </div>
              )
            }
            return (
              <div className="border p-4 rounded-xl">
                Signer: {signer}<br />
                Signature: <button className="btn btn-xs" onClick={sign} disabled={!isSigner}>Sign</button>
              </div>
            )
          })
        }
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={broadcast} className={`btn w-full btn-success ${loading ? ' loading ': ''}`} disabled={transaction.signatures.length < threshhold || loading}>Broadcast</button>
        <button onClick={deleteTransaction} className={`btn btn-error w-full ${loading ? ' loading ': ''}`} disabled={loading}>Delete</button>
      </div>
    </div>
  )
}

export default Transaction;
