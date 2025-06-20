import { Button, Callout } from '@refractor-labs/design-system-vite';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { SqualletContext } from 'src/components/Contexts/Squallet';
import { trpc } from 'src/utils/trpc';
import { useSigner } from 'wagmi';
import { SqualletClientContext } from 'src/components/Contexts/SqualletClient';
import { ethers } from 'ethers';
import ProposalHeader from 'src/components/ProposalDashboard/ProposalHeader';
import ProposalDetails from 'src/components/ProposalDashboard/ProposalDetails';
import ProposalApprovals from 'src/components/ProposalDashboard/ProposalApprovals';
import ProposalStatus from 'src/components/ProposalDashboard/ProposalStatus';
import {
    createUnsignedMpcTransaction,
    formatSignMessage,
    hashTransactionRequest,
    SqualletFeeData,
    SqualletTransactionRequest,
    UnsignedMpcTransaction,
} from '@refactor-labs/squallet-protocol';
import { useTokenCookie } from 'hooks/useTokenCookie';
import { useNonce } from 'src/hooks/useNonce';
import { useProvider } from 'src/hooks/useProvider';

export default function Home() {
    const router = useRouter();
    const { query } = router;
    const proposalId = query.proposalId as string;
    const { data: proposal } = trpc.proposal.get.useQuery({ id: proposalId });
    const squallet = useContext(SqualletContext);
    const squalletClient = useContext(SqualletClientContext);
    const { data: signer } = useSigner();
    const addSignature = trpc.proposal.addSignature.useMutation();
    const execute = trpc.proposal.execute.useMutation();
    const utils = trpc.useContext();
    const { generateToken } = useTokenCookie();

    const { data: activeProposalsBySquallet } = trpc.proposal.proposalsBySquallet.useQuery(
        {
            squalletId: proposal?.squalletId as string,
            proposalStage: 'PROPOSED',
        },
        { enabled: !!proposal },
    );

    const nonce = useNonce(
        squallet?.pkp[0]?.pkpAddress,
        (proposal?.data as any)?.details?.tx?.chainId as number,
    );
    const proposalsBefore =
        activeProposalsBySquallet && proposal && (proposal?.data as any)?.details?.tx?.chainId
            ? activeProposalsBySquallet.filter(
                  (a) =>
                      a.createdAt < proposal.createdAt &&
                      a.proposalType === 'SIGN_TRANSACTION' &&
                      (a?.data as any)?.details?.tx?.chainId ==
                          (proposal?.data as any)?.details?.tx?.chainId,
              ).length
            : 0;
    const desiredNonce =
        proposal?.proposalType === 'SIGN_TRANSACTION' ? nonce + proposalsBefore : 0;

    const provider = useProvider((proposal?.data as any)?.details?.tx?.chainId || 1);

    if (!proposal || !squallet?.pkp.length || !provider) {
        return;
    }

    const tx: SqualletTransactionRequest = {
        ...((proposal.data as any)?.details?.tx || {}),
        nonce: desiredNonce,
    };

    const sign = async () => {
        if (!proposal || !squalletClient) {
            return;
        }
        switch (proposal.proposalType) {
            case 'SIGN_MESSAGE': {
                if (!(proposal.data as any)?.details?.message) {
                    return;
                }
                try {
                    const resp = await signer?.signMessage(
                        formatSignMessage((proposal.data as any).details.message as string, 1),
                    );
                    await generateToken();
                    await addSignature.mutateAsync({
                        proposalId: proposal.id,
                        signature: resp as string,
                        nonce: desiredNonce,
                    });
                    await utils.proposal.get.invalidate();
                } catch {}
            }
            case 'SIGN_TRANSACTION': {
                const details = (proposal?.data as any)?.details;
                if (!details?.tx || !details?.fee) {
                    return;
                }

                if (!tx) {
                    return;
                }
                try {
                    await generateToken();
                    const resp = await signer?.signMessage(hashTransactionRequest(tx));
                    await addSignature.mutateAsync({
                        proposalId: proposal.id,
                        signature: resp as string,
                        nonce: desiredNonce,
                    });
                    await utils.proposal.get.invalidate();
                } catch {}
            }
        }
    };

    const executeProposal = async () => {
        let signature = '';
        if (!proposal || !squalletClient || !squallet?.pkp.length || !provider) {
            return;
        }
        switch (proposal.proposalType) {
            case 'SIGN_MESSAGE':
                const signMessageResp = await squalletClient.sendRequest({
                    message: {
                        message: (proposal.data as any).details.message as string,
                        signatures: proposal.signatures.map((s) => ({
                            signature: s.signature,
                            signerAddress: ethers.getAddress(s.address),
                        })),
                    },
                    method: 'signMessage',
                    version: '1.0',
                });
                if (!signMessageResp.signatures['sig1']) {
                    alert('Check console log for errors');
                    return;
                }
                signature = signMessageResp.signatures['sig1'].signature;
                break;
            case 'SIGN_TRANSACTION':
                const signTxResp = await squalletClient.sendRequest({
                    message: {
                        signedTransaction: {
                            transaction: tx,
                            signatures: proposal.signatures.map((s) => ({
                                signature: s.signature,
                                signerAddress: ethers.getAddress(s.address),
                            })),
                        },
                        fee: (proposal.data as any).details.fee,
                    },
                    method: 'signTransaction',
                    version: '1.0',
                });
                if (!signTxResp.signatures['sig1']) {
                    alert('Check console log for errors');
                    return;
                }
                signature = signTxResp.signatures['sig1'].signature;
        }
        if (!signature) {
            alert('Unsupported execution');
            return;
        }
        if (proposal.proposalType === 'SIGN_TRANSACTION') {
            const unsignedTx: UnsignedMpcTransaction = createUnsignedMpcTransaction(
                tx,
                (proposal.data as any).details.fee,
            );
            const signedTransaction = ethers.utils.serializeTransaction(unsignedTx, signature);
            await provider.sendTransaction(signedTransaction);
        }
        await generateToken();
        await execute.mutateAsync({
            proposalId: proposal.id,
            signature,
        });
        await utils.proposal.get.invalidate();
    };

    const canExecute =
        proposal.signatures?.length >= squallet.threshold &&
        (proposal?.proposalType === 'SIGN_TRANSACTION' ? proposalsBefore === 0 : true);

    return (
        <>
            <div className="min-h-screen">
                <ProposalHeader proposal={proposal} />
                <div className="w-full grid grid-cols-2 ">
                    <div className="col-span-1 grid grid-cols-1 gap-4 pr-4">
                        <Callout className="mt-4" intent="green">
                            Action
                        </Callout>
                        <ProposalDetails
                            proposal={proposal}
                            tx={tx}
                            fee={(proposal?.data as any).details?.fee as SqualletFeeData}
                        />
                        <span className="text-xs uppercase text-default">Label</span>
                        <div className="border border-line-default-secondary rounded-lg p-4">
                            Amount
                        </div>
                    </div>
                    <div className="col-span-1 grid grid-cols-1 gap-4 pl-4">
                        <ProposalStatus proposal={proposal} />
                        <ProposalApprovals squallet={squallet} proposal={proposal} sign={sign} />
                        <div className="border border-line-default-secondary rounded-lg p-4">
                            <span className="text-default-focus text-sm">Executions</span>
                            {proposal.executions.map((e, i) => (
                                <pre key={i}>{JSON.stringify(e, null, 2)}</pre>
                            ))}
                            <Button
                                disabled={!canExecute}
                                intent="outlineActive"
                                className="w-24"
                                onClick={executeProposal}
                            >
                                Execute
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
