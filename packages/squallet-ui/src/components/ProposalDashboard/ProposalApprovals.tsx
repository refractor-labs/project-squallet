import { ProposalDetailed, SqualletDetailed } from 'src/types';
import UserWithAvatar from '../UserWithAvatar';
import { Proposal } from 'src/prisma';
import { Button, Callout } from '@refractor-labs/design-system-vite';
import { useAccount } from 'wagmi';

type Props = {
    squallet: SqualletDetailed;
    proposal: ProposalDetailed;
    sign: () => void;
};

const ProposalApprovals = ({ squallet, proposal, sign }: Props) => {
    const { address } = useAccount();
    return (
        <>
            <div className="border border-line-default-secondary rounded-lg p-4">
                <span className="text-default-focus text-sm">Approvals</span>
                {squallet?.users.map((user) => (
                    <div key={user.id} className="flex justify-between items-center">
                        <UserWithAvatar userAddress={user.user.address} short={true} />

                        {proposal.signatures?.find(
                            (s) =>
                                s.address.toLocaleLowerCase() ===
                                user.user.address.toLocaleLowerCase(),
                        )
                            ? 'Signed'
                            : ''}

                        {user.user.address === address?.toLocaleLowerCase() ? (
                            <Button intent="outlineActive" className="w-24" onClick={sign}>
                                Sign
                            </Button>
                        ) : (
                            <Button intent="text" className="w-24" disabled>
                                Pending
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};
export default ProposalApprovals;
