import { Provider } from 'ethers';
import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';
import { SetRes } from 'src/apiutil/response';
import { trpc } from './trpc';
import { compareSignatures } from 'helpers/compareSignature';
import { Squallet } from 'src/prisma';
import { getProvider } from '@refractor-labs/core-lib/blockchain';

export const TokenRequired = 'TokenRequired';
export const OwnerRequired = 'OwnerRequired';
export const MemberRequired = 'MemberRequired';
export const CreatorRequired = 'CreatorRequired';
export const TeamRequired = 'TeamRequired';
const allAccessTypes = [
    TokenRequired,
    OwnerRequired,
    MemberRequired,
    CreatorRequired,
    TeamRequired,
];

export type AccessControlTypes =
    | 'TokenRequired'
    | 'OwnerRequired'
    | 'MemberRequired'
    | 'CreatorRequired'
    | 'TeamRequired';

export type AccessControlResponse =
    | {
          ok: true;
          recoveredAddress: string;
          setResponse?: SetRes;
          code: number;
          squallet?: Squallet;
      }
    | {
          ok: false;
          code: number;
          recoveredAddress?: string;
          setResponse: SetRes;
          squallet?: Squallet;
      };

interface SqualletRequest {
    squalletId?: string;
    proposalId?: string;
}

export async function checkAccessControl(
    accessNeeded: AccessControlTypes,
    req: NextApiRequest | NextRequest,
    squalletRequest: SqualletRequest,
): Promise<AccessControlResponse> {
    if (!allAccessTypes.includes(accessNeeded)) {
        throw new Error(
            `invalid accessNeeded: ${accessNeeded}, must be one of [${allAccessTypes.join(',')}]`,
        );
    }

    // do signature check
    const signatureCompare = await compareSignatures(req);
    if (signatureCompare?.error) {
        return {
            ok: false,
            code: 401,
            setResponse: (res) => {
                res.status(401).json({ error: 'unauthorized' });
            },
        };
    }

    const recoveredAddress = signatureCompare.recoveredAddress;
    if (!recoveredAddress) {
        return {
            ok: false,
            code: 500,
            setResponse: (res) => {
                res.status(500).json({ error: "couldn't recover address" });
            },
        };
    }

    if (accessNeeded === TokenRequired) {
        return { ok: true, recoveredAddress, code: 200 };
    }

    const ownershipRequired = accessNeeded === OwnerRequired;
    const membershipRequired = accessNeeded === MemberRequired;
    const creatorRequired = accessNeeded === CreatorRequired;
    const teamRequired = accessNeeded === TeamRequired;

    if (!ownershipRequired && !membershipRequired && !creatorRequired) {
        return { ok: true, recoveredAddress, code: 200 };
    }
    const { squalletId, proposalId } = squalletRequest;
    if (!squalletId && !proposalId) {
        throw new Error('missing squalletId for access control');
    }

    const squallet = await trpc.squallet.get.useQuery(
        { id: squalletId as string },
        {
            enabled: !!squalletId,
        },
    );
    if (!squallet) {
        return {
            ok: false,
            recoveredAddress,
            code: 404,
            setResponse: (res) => {
                res.status(404).json({ error: 'not found' });
            },
        };
    }

    return {
        ok: true,
        recoveredAddress,
        code: 200,
        setResponse: (res) => {
            res.status(200).json({ message: 'Success!' });
        },
    };
}
