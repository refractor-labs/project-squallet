import { BigNumber } from '@ethersproject/bignumber';

export type PkpConfig = {
    owners: string[];
    threshold: BigNumber;
    governanceVersion: BigNumber;
};
