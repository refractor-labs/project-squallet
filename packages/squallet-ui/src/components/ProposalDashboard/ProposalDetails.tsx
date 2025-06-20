import { SqualletFeeData, SqualletTransactionRequest } from '@refactor-labs/squallet-protocol';
import { Proposal } from 'src/prisma';
import { RenderProposalDetails } from 'src/utils/proposal';

type Props = {
    proposal: Proposal;
    tx?: SqualletTransactionRequest;
    fee?: SqualletFeeData;
};
const ProposalDetails = ({ proposal, tx, fee }: Props) => {
    return (
        <>
            <span className="text-xs uppercase text-default">Proposal Details</span>
            <div className="border border-line-default-secondary rounded-lg p-4 ">
                {RenderProposalDetails(proposal, tx, fee)}
            </div>
        </>
    );
};

export default ProposalDetails;
