import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

export const useProvider = (chainId: number | undefined) => {
    const [provider, setProvider] = useState<ethers.Provider | null>(null);

    useEffect(() => {
        if (!chainId) {
            setProvider(null);
            return;
        }
        setProvider(ethers.getDefaultProvider(chainId));
    }, [chainId]);
    return provider;
};
