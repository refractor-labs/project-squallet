import { Button } from '@refractor-labs/design-system-vite';
import Card from './Card';
import { useContext, useState } from 'react';
import { trpc } from 'src/utils/trpc';
import { useRouter } from 'next/router';
import { SqualletContext } from '../Contexts/Squallet';
import { Prisma, Proposal, ProposalStage, User } from 'src/prisma';
import { shortenHex } from 'src/utils/address';
import Blockies from 'react-blockies';
import { formatDate } from 'src/utils/date';
import Link from 'next/link';

type Props = {
    proposal: Proposal & {
        creator: User;
    };
};

const ProposalCard = ({ proposal }: Props) => {
    const [discarding, setDiscarding] = useState(false);
    const update = trpc.proposal.update.useMutation();
    const utils = trpc.useContext();
    const router = useRouter();
    const squallet = useContext(SqualletContext);
    const { PROPOSED } = ProposalStage;

    const proposalData = proposal.data as Prisma.JsonObject;

    const discardProposal = async () => {
        setDiscarding(true);
        try {
            await update.mutateAsync({
                id: proposal.id,
                proposalStage: 'CANCELLED',
            });
            utils.proposal.proposalsBySquallet.invalidate();
        } catch (e) {
            console.log(e);
        }
        setDiscarding(false);
    };

    return (
        <Card isClickable={false}>
            <div className="flex flex-row justify-between ">
                <div className="flex flex-col gap-2">
                    <strong className="bold">{proposal.proposalType}</strong>
                    <div className="flex gap-2">
                        <span className="text-xs inline-block items-center">Proposed by </span>

                        <Blockies
                            size={6}
                            seed={proposal.creator?.address}
                            className="rounded-full"
                        />
                        <span className="text-xs text-default-focus">
                            {' '}
                            {shortenHex(proposal.creator?.address)}
                        </span>
                        <span className="text-xs"> on {formatDate(proposal.createdAt)}</span>
                    </div>
                    <span className="text-sm">{proposal.description}</span>

                    <span className="header-sm-caps">{proposal.proposalStage}</span>
                </div>

                <div className="flex flex-col justify-end">
                    <div className="flex gap-4">
                        <Link href={`/squallets/${squallet?.id}/proposals/${proposal.id}`}>
                            <Button intent="outline" className="w-20">
                                View
                            </Button>
                        </Link>
                        {proposal.proposalStage === PROPOSED && (
                            <Button
                                intent="outlineAlert"
                                className="w-28"
                                isLoading={discarding}
                                onClick={async () => {
                                    await discardProposal();
                                }}
                            >
                                Discard
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ProposalCard;
