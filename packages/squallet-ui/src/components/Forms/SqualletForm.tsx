import { useContext, useState } from 'react';
import { useSigner } from 'wagmi';
import { trpc } from 'src/utils/trpc';
import { Button } from '@refractor-labs/design-system-vite';
import { InputProps } from '../Shared/Input';
import Form from '../Shared/Form';
import z from 'zod';
import { ethRegex } from 'src/utils/regex/ethRegex';
import { ApiContext } from '../Contexts/Api';

const inputs: InputProps[] = [
    {
        label: 'Name',
        name: 'name',
        placeholder: 'Squallet Name',
        type: 'text',
        intent: 'input',
    },
    {
        label: 'Signers',
        name: 'signers',
        placeholder: 'List of Signers',
        type: 'text',
        intent: 'textArea',
    },
    {
        label: 'Threshold',
        name: 'threshold',
        type: 'number',
        intent: 'quantity',
    },
];

const emptySquallet = {
    address: '',
    name: '',
    signers: [],
    threshold: 0,
};

export const SqualletForm = ({ onOpenChange, onFailure }) => {
    const [submitting, setSubmitting] = useState(false);

    const utils = trpc.useContext();

    const api = useContext(ApiContext);
    const create = trpc.squallet.create.useMutation();
    const { data: signer } = useSigner();
    const signerAddress = signer?.getAddress();

    if (!signer || !signerAddress) {
        console.error('No signer found');
        return null;
    }
    const handleFailure = (e) => {
        onFailure(e);
    };

    const createSquallet = async (values: any) => {
        setSubmitting(true);

        try {
            const squallet = await create.mutateAsync({
                name: values.name,
                signers: values.signers.split('\n'),
                threshold: values.threshold as number,
            });
            utils.squallet.list.invalidate();

            try {
                if (squallet?.pkp[0]?.pkpAddress) {
                    await api?.watchApi.patchWatchAddress(squallet?.pkp[0]?.pkpAddress);
                }
            } catch (e) {
                console.error(`Error occurred adding squallet to watchlist`);
                handleFailure(e);
            }
        } catch (e) {
            handleFailure(e);
        }
        setSubmitting(false);
        onOpenChange(false);
    };

    const squalletFormSchema = z.object({
        name: z.string().nonempty({ message: 'Name is required' }),

        signers: z
            .string({ invalid_type_error: 'At least one signer is required' })
            .nonempty({ message: 'At least one signer is required' })
            .refine(
                (value) => {
                    const trimmedValue = value.trim();
                    const values = trimmedValue.split(/[\n,]+/).map((str) => str.trim());
                    return values.every((str) => ethRegex.test(str));
                },
                { message: 'Invalid address format' },
            )
            .transform((value) => {
                const trimmedValue = value.trim();
                const values = trimmedValue.split(/[\n,]+/).map((str) => str.trim());
                return values.filter((str) => str !== '');
            }),

        threshold: z.number().positive({ message: 'Enter a valid number' }),
    });

    return (
        <>
            <Form
                value={emptySquallet}
                inputs={inputs}
                validationSchema={squalletFormSchema}
                onSubmit={async (values: any) => {
                    await createSquallet(values);
                }}
            >
                <Button fullWidth isLoading={submitting} type="submit">
                    Create
                </Button>
            </Form>
        </>
    );
};

export default SqualletForm;
