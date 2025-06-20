import { SqualletContext } from 'src/components/Contexts/Squallet';
import { useContext } from 'react';
import { useAccount, useNetwork, useSigner } from 'wagmi';
import { trpc } from 'src/utils/trpc';
import { useRouter } from 'next/router';
import { ProposalType } from 'src/prisma';
import { lowerCaseAddress } from 'src/utils/address';
import ProposalForm from 'src/components/Forms/ProposalForm';
import { InputProps } from 'src/components/Shared/Input';
import { z } from 'zod';
import { ethRegex } from 'src/utils/regex/ethRegex';
import { useTokenCookie } from 'hooks/useTokenCookie';
import { ethers } from 'ethers';
import { SqualletFeeData, SqualletTransactionRequest } from '@refactor-labs/squallet-protocol';

const emptyProposal = {
    to: '',
    data: '',
    value: '',
};

type SignTransactionData = {
    createdBy: string;
    details: {
        to: string;
        data: string;
        value: string;
    };

    signers: string[];
};

const inputs: InputProps[] = [
    {
        label: 'To',
        name: 'to',
        type: 'text',
        intent: 'input',
    },
    {
        label: 'Data',
        name: 'data',
        type: 'text',
        intent: 'textArea',
    },
    {
        label: 'Value',
        name: 'value',
        type: 'text',
        intent: 'textArea',
    },
];

export default function Home() {
    const squallet = useContext(SqualletContext);
    const { address } = useAccount();
    const { chain } = useNetwork();
    const create = trpc.proposal.create.useMutation();
    const utils = trpc.useContext();
    const router = useRouter();
    const { generateToken } = useTokenCookie();
    const { data: signer } = useSigner();
    const signerAddress = signer?.getAddress();

    const SIGN_TRANSACTION = ProposalType.SIGN_TRANSACTION;

    if (!squallet?.pkp.length) {
        return;
    }

    const createProposal = async (values: any) => {
        await generateToken();
        if (signerAddress) {
            try {
                const value: string = await signerAddress;
                const provider = ethers.getDefaultProvider(chain?.id || 1);
                const feeData = await provider.getFeeData();
                const estimate = await provider.estimateGas({
                    from: ethers.getAddress(squallet.pkp[0].pkpAddress),
                    to: ethers.getAddress(values.to),
                    value: values.value || '0x00',
                    data: values.data || '0x',
                });

                const { maxFeePerGas, maxPriorityFeePerGas } = feeData;
                if (!maxFeePerGas || !maxPriorityFeePerGas || !estimate) {
                    return;
                }

                const maxFee = estimate * maxFeePerGas * 7n;

                const tx: SqualletTransactionRequest = {
                    to: ethers.getAddress(values.to),
                    from: squallet.pkp[0].pkpAddress,
                    nonce: 0,
                    gasLimit: estimate.toString(),
                    gasPrice: undefined,
                    data: '0x',
                    value: '0x0',
                    chainId: chain?.id || 1,
                    type: 2,
                    maxPriorityFeePerGas: undefined,
                    maxFeePerGas: undefined,
                    maxFee: maxFee.toString(),
                    governanceVersion: 1,
                };

                const fee: SqualletFeeData = {
                    maxFeePerGas: maxFeePerGas.toString(),
                    maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
                };

                await create.mutateAsync({
                    squalletId: squallet.id,
                    proposalType: SIGN_TRANSACTION,
                    name: '',
                    description: '',
                    data: {
                        signers: [],
                        createdBy: lowerCaseAddress(value),
                        details: {
                            tx,
                            fee,
                        },
                    },
                });
                utils.proposal.proposalsBySquallet.invalidate();
            } catch (e) {
                console.log(e);
            }
        }
    };

    const validationSchema = z.object({
        to: z
            .string()
            .regex(ethRegex, { message: 'Must be a valid address' })
            .transform((value) => value.trim()),
        data: z.string().nonempty({ message: 'Data is required' }),
        value: z.string().nonempty({ message: 'Value is required' }),
    });

    return (
        <>
            <ProposalForm
                title="Sign Transaction"
                proposalType={SIGN_TRANSACTION}
                onSubmit={async (values: any) => {
                    await createProposal(values);
                    router.push(`/squallets/${squallet?.id}/proposals`);
                }}
                inputs={inputs}
                value={emptyProposal}
                validationSchema={validationSchema}
            />
        </>
    );
}
