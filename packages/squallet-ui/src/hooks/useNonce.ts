import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

export const useNonce = (address: string | undefined, chainId: number | undefined) => {
    const [nonce, setNonce] = useState<number>(0);

    useEffect(() => {
        if (!address || !chainId) {
            setNonce(0);
            return;
        }
        (async () => {
            setNonce(await ethers.getDefaultProvider(chainId).getTransactionCount(address));
        })();
    }, [address, chainId]);
    return nonce;
};
