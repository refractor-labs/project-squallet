import { ProposalDetailed } from 'src/types';

type Props = {
    proposal: ProposalDetailed;
};
const ProposalStatus = ({ proposal }: Props) => {
    return (
        <>
            <div className="flex flex-col border border-line-default-secondary rounded-lg p-4 mt-4">
                <span className="text-default-focus text-sm">Status</span>
                <span className="text-orange text-lg bold">{proposal?.proposalStage}</span>
            </div>
        </>
    );
};

export default ProposalStatus;
