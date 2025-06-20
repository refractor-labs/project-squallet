import { SqualletContext } from 'src/components/Contexts/Squallet';
import { useContext, useEffect, useState } from 'react';
import { Button, Form } from '@refractor-labs/design-system-vite';
import { useAccount, useSigner } from 'wagmi';
import { trpc } from 'src/utils/trpc';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import UserWithAvatar from 'src/components/UserWithAvatar';
import ProposalForm from 'src/components/Forms/ProposalForm';
import { ProposalType } from 'src/prisma';
import { lowerCaseAddress } from 'src/utils/address';
import { InputProps } from 'src/components/Shared/Input';
import { z } from 'zod';
import { useTokenCookie } from 'hooks/useTokenCookie';

const emptyProposal = {
    proposedSigners: [''],
    threshold: 1,
};

const inputs: InputProps[] = [
    {
        label: 'Threshold',
        name: 'threshold',
        type: 'number',
        intent: 'quantity',
    },
];

export type ModifyMembersData = {
    createdBy: string;
    details: {
        proposedSigners: string[];
        threshold: number;
    };

    signers: string[];
};

export default function Home() {
    const squallet = useContext(SqualletContext);
    const users = squallet?.users;
    const [usersList, setUsersList] = useState<string[]>(
        users?.map((user) => user.user.address) ?? [],
    );
    const [newSigners, setNewSigners] = useState<string[]>([]);
    const [newSigner, setNewSigner] = useState<string>('');
    const [creating, setCreating] = useState(false);
    const create = trpc.proposal.create.useMutation();
    const utils = trpc.useContext();
    const router = useRouter();
    const [invalidAddress, setInvalidAddress] = useState<boolean>(true);
    const [errorMessages, setErrorMessages] = useState<string[]>(['']);
    const { generateToken } = useTokenCookie();
    const { data: signer } = useSigner();
    const signerAddress = signer?.getAddress();
    const { MODIFY_MEMBERS } = ProposalType;

    useEffect(() => {
        setNewSigners(usersList);
        setNewSigner('');
    }, [usersList]);

    if (!squallet) {
        return null;
    }

    const createProposal = async (values: any) => {
        setCreating(true);
        await generateToken();
        if (signerAddress) {
            try {
                const value: string = await signerAddress;

                await create.mutateAsync({
                    squalletId: squallet.id,
                    proposalType: 'MODIFY_MEMBERS',
                    name: '',
                    description: '',
                    data: {
                        signers: [],
                        createdBy: lowerCaseAddress(value),
                        details: {
                            proposedSigners: newSigners,
                            threshold: values.threshold,
                        },
                    },
                });

                utils.proposal.proposalsBySquallet.invalidate();
            } catch (e) {
                console.log(e);
            }
            setCreating(false);
        }
    };

    const validationSchema = z.object({
        threshold: z
            .number({
                invalid_type_error: 'Threshold required',
            })

            .lte(usersList.length, {
                message: 'Threshold cannot be greater than the proposed list of signers',
            }),
    });

    return (
        <>
            <ProposalForm
                title="Modify Members"
                proposalType={MODIFY_MEMBERS}
                onSubmit={async (values: any) => {
                    await createProposal(values);
                    router.push(`/squallets/${squallet?.id}/proposals`);
                }}
                inputs={inputs}
                value={emptyProposal}
                validationSchema={validationSchema}
            >
                <span className="text-xs mt-4 text-default">Add Signing members </span>

                <div className="flex gap-4">
                    <Form.Field
                        fieldType="input"
                        fieldSize="large"
                        value={newSigner}
                        onChange={(
                            e:
                                | React.ChangeEvent<HTMLInputElement>
                                | React.ChangeEvent<HTMLTextAreaElement>,
                        ) => {
                            const input = e.target.value;
                            setInvalidAddress(
                                !ethers.isAddress(input) ||
                                    newSigners.includes(input.toLocaleLowerCase()),
                            );
                            setErrorMessages(['']);
                            setNewSigner(e.target.value.toLocaleLowerCase());
                            if (newSigners.includes(input.toLocaleLowerCase())) {
                                setErrorMessages((prev) => [...prev, 'Signer already added']);
                            }
                        }}
                    ></Form.Field>

                    <Button
                        size="large"
                        intent="outline"
                        disabled={invalidAddress}
                        onClick={async () => {
                            setUsersList((prevList) => [...prevList, newSigner]);
                            setInvalidAddress(true);
                        }}
                    >
                        + Add
                    </Button>
                </div>
                <div className="flex flex-col mt-4">
                    {usersList?.map((userAddress, index) => (
                        <div key={`${userAddress}-${index}`} className="flex gap-4 items-center">
                            <Button
                                intent="outlineAlert"
                                onClick={() => {
                                    const updatedList = [...usersList];
                                    updatedList.splice(index, 1);
                                    setUsersList(updatedList);
                                }}
                            >
                                Delete
                            </Button>

                            <UserWithAvatar userAddress={userAddress} short={true} />
                        </div>
                    ))}
                </div>
            </ProposalForm>
        </>
    );
}
