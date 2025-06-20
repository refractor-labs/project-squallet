import { ethers } from 'ethers';
import { useMemo } from 'react';
import { ethRegex } from './regex/ethRegex';

export const lowerCaseAddress = (address: string) => {
    return address.toLocaleLowerCase();
};

export function shortenHex(hex: string, length = 4) {
    return `${hex?.substring(0, length + 2)}…${hex?.substring(hex?.length - length)}`;
}

export const useChecksummedAddress = (address: string | null | undefined) => {
    const checksummedAddress = useMemo(() => {
        if (address) {
            try {
                const isValid = ethRegex.test(address);
                if (!isValid) throw new Error('Not a valid Ethereum address');

                return ethers.getAddress(address);
            } catch (e) {
                return address;
            }
        }
        return '';
    }, [address]);

    return {
        checksummedAddress,
    };
};
