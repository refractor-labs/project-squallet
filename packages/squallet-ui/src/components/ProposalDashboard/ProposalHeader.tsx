import { Prisma, Proposal, User } from 'src/prisma';
import Blockies from 'react-blockies';
import { shortenHex } from 'src/utils/address';
import { formatDate } from 'src/utils/date';

type Props = {
    proposal: Proposal & {
        creator: User;
    };
};

const ProposalHeader = ({ proposal }: Props) => {
    return (
        <>
            <span className="text-default-focus text-3xl font-bold mb-4">
                {proposal?.proposalType}
            </span>
            <div className="w-full flex flex-col header-xl ">
                <span className="header-xl text-default-focus mb-2">{proposal?.name}</span>

                <div className="flex gap-2">
                    <span className="text-xs inline-block items-center">Proposed by </span>

                    <Blockies size={6} seed={proposal.creator?.address} className="rounded-full" />
                    <span className="text-xs text-default-focus">
                        {' '}
                        {shortenHex(proposal.creator?.address as string)}
                    </span>
                    <span className="text-xs"> on {formatDate(proposal.createdAt)}</span>
                </div>
            </div>
        </>
    );
};

export default ProposalHeader;
