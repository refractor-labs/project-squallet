import { Button, Callout } from '@refractor-labs/design-system-vite';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { ProposalType } from 'src/prisma';
import { trpc } from 'src/utils/trpc';
import Card from '../Cards/Card';
import Link from 'next/link';
import { SqualletContext } from '../Contexts/Squallet';
import { InputProps } from '../Shared/Input';
import Form from '../Shared/Form';

type Props = {
    title: string;
    proposalType: ProposalType;
    children?: React.ReactNode;
    onSubmit: (values: any) => void;
    inputs: InputProps[];
    value: any;
    validationSchema: any;
};

const defaultInputs: InputProps[] = [
    //repurposing schema fields 'name' and 'description' for now
    {
        label: 'Title',
        name: 'name',
        type: 'text',
        intent: 'input',
    },
    {
        label: 'Image Url',
        name: 'description',
        type: 'text',
        intent: 'input',
    },
];

export default function ProposalForm({
    title,
    proposalType,
    children,
    onSubmit,
    inputs,
    value,
    validationSchema,
}: Props) {
    const router = useRouter();
    const squallet = useContext(SqualletContext);
    const [submitting, setSubmitting] = useState<boolean>(false);

    return (
        <>
            <div className="min-h-screen">
                <div className="gap-4">
                    <div></div>
                    <div className="flex flex-col mb-8 gap-4">
                        <span className="header-sm-caps text-default">Proposal</span>
                        <span className="text-default-focus text-3xl font-bold mb-4">{title}</span>
                        <p className="text-default text-body-md">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tempor
                            consectetur lacinia. Phasellus feugiat elit eget felis cursus, nec
                            tristique risus scelerisque. Aliquam efficitur nunc nec ipsum fermentum
                            bibendum. Quisque aliquet erat in felis pulvinar, a euismod turpis
                            accumsan. Praesent non finibus urna. Nullam bibendum enim vitae lacus
                            finibus scelerisque.
                        </p>
                    </div>
                    <div>
                        <Card isClickable={false}>
                            <div className="flex flex-col">
                                <Callout hasIcon intent="blue" className="my-4">
                                    Recommendation
                                </Callout>
                                <Form
                                    value={value}
                                    inputs={[...defaultInputs, ...inputs]}
                                    validationSchema={validationSchema}
                                    onSubmit={async (values: any) => {
                                        setSubmitting(true);
                                        await onSubmit(values);
                                        setSubmitting(false);
                                    }}
                                >
                                    {children}
                                    <div className="justify-center flex gap-4 mt-8">
                                        <Link href={`/squallets/${squallet?.id}/proposals`}>
                                            <Button intent="outline">Cancel</Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            intent="outline"
                                            isLoading={submitting}
                                            disabled={submitting}
                                        >
                                            Create
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
