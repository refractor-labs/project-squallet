import { SqualletContext } from 'src/components/Contexts/Squallet';
import { useContext, useState } from 'react';
import { useAccount, useSigner } from 'wagmi';
import { trpc } from 'src/utils/trpc';
import { useRouter } from 'next/router';
import { ProposalType } from 'src/prisma';
import ProposalForm from 'src/components/Forms/ProposalForm';
import { InputProps } from 'src/components/Shared/Input';
import { z } from 'zod';
import { useTokenCookie } from 'hooks/useTokenCookie';
import { lowerCaseAddress } from 'src/utils/address';

const emptyProposal = {
    message: '',
};

const inputs: InputProps[] = [
    {
        label: 'Message',
        name: 'message',
        type: 'text',
        intent: 'textArea',
    },
];

export default function Home() {
    const squallet = useContext(SqualletContext);
    const create = trpc.proposal.create.useMutation();
    const utils = trpc.useContext();
    const router = useRouter();
    const { SIGN_MESSAGE } = ProposalType;

    const { generateToken } = useTokenCookie();
    const { data: signer } = useSigner();
    const signerAddress = signer?.getAddress();

    if (!squallet) {
        return;
    }

    const createProposal = async (values: any) => {
        await generateToken();
        if (signerAddress) {
            try {
                const value: string = await signerAddress;
                await create.mutateAsync({
                    squalletId: squallet.id,
                    proposalType: 'SIGN_MESSAGE',
                    name: '',
                    description: '',
                    data: {
                        signers: [],
                        createdBy: lowerCaseAddress(value),
                        details: {
                            message: values.message,
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
        message: z.string().nonempty({ message: 'Message is required' }),
    });

    return (
        <>
            <ProposalForm
                title="Sign Message"
                proposalType={SIGN_MESSAGE}
                onSubmit={async (values: any) => {
                    await createProposal(values);
                    router.push(`/squallets/${squallet?.id}/proposals`);
                }}
                inputs={inputs}
                value={emptyProposal}
                validationSchema={validationSchema}
            ></ProposalForm>
        </>
    );
}
