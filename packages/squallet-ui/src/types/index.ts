import { Action, Pkp, Proposal, Signature, Squallet, SqualletUser, User } from 'src/prisma';

export type PkpDetailed = Pkp & {
    actions: Action[];
};

export type SqualletUserDetailed = SqualletUser & {
    user: User;
};

export type SqualletDetailed = Squallet & {
    pkp: PkpDetailed[];
    users: SqualletUserDetailed[];
};

export type ProposalDetailed = Proposal & {
    signatures: Signature[];
};
