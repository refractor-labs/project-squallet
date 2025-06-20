import { Button, Switch } from '@refractor-labs/design-system-vite';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProposalCard from 'src/components/Cards/ProposalCard';
import { trpc } from 'src/utils/trpc';
import { useEffect, useState } from 'react';
import { ProposalStage } from 'src/prisma';

export default function Home() {
    const router = useRouter();
    const { query } = router;
    const squalletId = query.squalletId as string;
    const { PROPOSED } = ProposalStage;
    const [checked, setChecked] = useState<boolean>(false);
    const [showInactive, setShowInactive] = useState<boolean>(false);
    const activeProposalsBySquallet = trpc.proposal.proposalsBySquallet.useQuery(
        {
            squalletId: squalletId as string,
            proposalStage: PROPOSED,
        },
        { enabled: !!squalletId },
    );
    const { data } = activeProposalsBySquallet;
    const inactiveProposalsBySquallet = trpc.proposal.proposalsBySquallet.useQuery(
        {
            squalletId: squalletId as string,
        },
        { enabled: !!squalletId },
    );
    const { data: inactiveData } = inactiveProposalsBySquallet;

    useEffect(() => {
        setChecked(showInactive);
    }, [showInactive]);

    return (
        <>
            <div className="min-h-screen overflow-auto">
                <div className="justify-between"></div>
                <div className="flex justify-between items-start mb-12">
                    <div className="flex flex-col gap-2">
                        <span className="header-md text-default-focus  font-bold">Proposals</span>
                        <div className="flex items-center gap-2">
                            <span className="header-sm-caps">Include Inactive</span>
                            <Switch
                                checked={checked}
                                onCheckedChange={() => setShowInactive(!showInactive)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col-reverse gap-4 items-center md:flex-row">
                        <div className="">
                            <Link href={`/squallets/${squalletId}/add-proposal`}>
                                <Button className="px-2 md:px-5">Add Proposal</Button>
                            </Link>
                        </div>
                    </div>
                </div>
                <span className="header-sm-caps text-default-focus">Current Proposal</span>

                <div className="flex flex-col my-6 gap-6">
                    {data && data.length > 0 && <ProposalCard proposal={data[0]} />}
                </div>

                <span className="header-sm-caps text-default-focus">Queued</span>
                <div className="flex flex-col my-6 gap-6">
                    {data &&
                        data.length > 1 &&
                        data
                            .slice(1)
                            .map((proposal) => (
                                <ProposalCard key={proposal.id} proposal={proposal} />
                            ))}
                </div>
                {checked && (
                    <>
                        <span className="header-sm-caps text-default-focus">Inactive</span>
                        <div className="flex flex-col my-6 gap-6">
                            {inactiveData &&
                                inactiveData.length > 0 &&
                                inactiveData.map((proposal) => (
                                    <ProposalCard key={proposal.id} proposal={proposal} />
                                ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
