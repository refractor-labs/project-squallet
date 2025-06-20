import { useContext } from 'react';
import { SqualletContext } from 'src/components/Contexts/Squallet';
import UserWithAvatar from 'src/components/UserWithAvatar';
import { Prisma, Proposal } from 'src/prisma';
import { useChecksummedAddress } from './address';
import { SqualletFeeData, SqualletTransactionRequest } from '@refactor-labs/squallet-protocol';

export const RenderProposalDetails = (
    proposal: Proposal,
    tx?: SqualletTransactionRequest,
    fee?: SqualletFeeData,
) => {
    const { proposalType } = proposal;
    const proposalData = proposal.data as Prisma.JsonObject;
    const proposalDetails = proposalData.details as Prisma.JsonObject;
    const { checksummedAddress } = useChecksummedAddress(proposalData.createdBy as string);
    const squallet = useContext(SqualletContext);

    switch (proposalType) {
        case 'MODIFY_MEMBERS':
            if (!squallet) {
                return;
            }
            const originalList = (squallet?.users).map(
                (user) => user.user.address,
            ) as Prisma.JsonArray;

            const originalSet = new Set(originalList);
            // const newThreshold = 0;
            const proposedList = proposalDetails.proposedSigners as Prisma.JsonArray;
            const proposedSet = new Set(proposedList);

            const addedSigners = proposedList.filter((item) => !originalSet.has(item));
            const removedSigners = originalList?.filter((item) => !proposedSet.has(item));

            return (
                <div className="flex flex-col">
                    <span className="header-sm-caps text-default">
                        {addedSigners.length} Signing Member to be Added
                    </span>
                    {addedSigners &&
                        addedSigners.length > 0 &&
                        addedSigners.map((signer, i) => (
                            <UserWithAvatar
                                key={i}
                                userAddress={JSON.stringify(signer).slice(1, -1)}
                                short={true}
                            />
                        ))}
                    <span className="header-sm-caps text-default">
                        {removedSigners.length} Signing Member to be Removed
                    </span>
                    {removedSigners &&
                        removedSigners.length > 0 &&
                        removedSigners.map((signer, i) => (
                            <UserWithAvatar key={i} userAddress={signer as string} short={true} />
                        ))}
                </div>
            );

        case 'SIGN_TRANSACTION':
            // const { checksummedAddress } = useChecksummedAddress(proposalData.createdBy as string);
            return (
                <>
                    <span className="header-sm-caps text-default">Creator</span>
                    <UserWithAvatar userAddress={checksummedAddress} short={true} />
                    {tx &&
                        Object.entries(tx).map(([key, value]) => (
                            <>
                                <p className="flex flex-col text-default-focus mb-4" key={key}>
                                    <span className="header-sm-caps text-default">
                                        {key.toLocaleUpperCase()}
                                    </span>
                                    {typeof value === 'string' ? value : JSON.stringify(value)}
                                </p>
                            </>
                        ))}
                    {fee &&
                        Object.entries(fee)
                            .filter(([, value]) => !!value)
                            .map(([key, value]) => (
                                <>
                                    <p className="flex flex-col text-default-focus mb-4" key={key}>
                                        <span className="header-sm-caps text-default">
                                            {key.toLocaleUpperCase()}
                                        </span>
                                        {typeof value === 'string' ? value : JSON.stringify(value)}
                                    </p>
                                </>
                            ))}
                </>
            );
        case 'SIGN_MESSAGE':

        default:
            return (
                <>
                    {Object.entries(proposalDetails).map(([key, value]) => (
                        <>
                            <p className="flex flex-col text-default-focus mb-4" key={key}>
                                <span className="header-sm-caps text-default">
                                    {key.toLocaleUpperCase()}
                                </span>
                                {JSON.stringify(value).slice(1, -1)}
                            </p>
                        </>
                    ))}
                </>
            );
    }
};
