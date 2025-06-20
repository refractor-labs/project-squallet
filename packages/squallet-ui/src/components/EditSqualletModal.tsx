import { useContext, useState } from 'react';
import { trpc } from 'src/utils/trpc';
import { Button, Modal } from '@refractor-labs/design-system-vite';
import { InputProps } from './Shared/Input';
import Form from './Shared/Form';
import z from 'zod';
import { SqualletContext } from './Contexts/Squallet';

const inputs: InputProps[] = [
    {
        label: 'Name',
        name: 'name',
        placeholder: 'Squallet Name',
        type: 'text',
        intent: 'input',
    },
];

const emptySquallet = {
    name: '',
};

type Props = {
    onSubmit: (name: string) => void;
};

const EditSqualletModal = ({ onSubmit }: Props) => {
    const [submitting, setSubmitting] = useState(false);
    const [open, setOpen] = useState(false);
    const utils = trpc.useContext();
    const squallet = useContext(SqualletContext);
    const update = trpc.squallet.update.useMutation();

    if (!squallet) {
        return null;
    }

    const updateSquallet = async (values: any) => {
        setSubmitting(true);

        try {
            await update.mutateAsync({
                id: squallet?.id,
                name: values.name,
            });
            utils.squallet.list.invalidate();
        } catch (e) {
            console.log(e);
        }

        setOpen(false);
    };

    const squalletFormSchema = z.object({
        name: z.string().nonempty({ message: 'Name is required' }),
    });

    return (
        <div>
            <a
                href="#"
                onClick={() => {
                    setOpen(!open);
                }}
                className="text-xs ml-1"
            >
                <u>Edit</u>
            </a>

            <Modal title="Update Squallet" open={open} onOpenChange={setOpen}>
                <Form
                    value={emptySquallet}
                    inputs={inputs}
                    validationSchema={squalletFormSchema}
                    onSubmit={async (values: any) => {
                        await updateSquallet(values);
                        onSubmit(values.name);
                        setSubmitting(false);
                    }}
                >
                    <Button fullWidth isLoading={submitting} type="submit">
                        Update
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default EditSqualletModal;
