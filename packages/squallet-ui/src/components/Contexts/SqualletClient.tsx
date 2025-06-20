import { SqualletWalletBrowserClient } from '@refactor-labs/squallet-client';
import { ReactNode, createContext, useContext, useMemo } from 'react';
import { SqualletContext } from './Squallet';
import { useSigner, useNetwork } from 'wagmi';

export const SqualletClientContext = createContext<SqualletWalletBrowserClient | null>(null);

type Props = {
    children: ReactNode;
};

export const SqualletClient = ({ children }: Props) => {
    const squallet = useContext(SqualletContext);
    const { chain } = useNetwork();
    const { data: signer } = useSigner();

    const squalletClient = useMemo(() => {
        if (!squallet || !chain || !squallet.pkp?.length || !signer) {
            return null;
        }
        return new SqualletWalletBrowserClient(
            {
                pkpAddress: squallet.pkp[0].pkpAddress,
                pkpId: squallet.pkp[0].pkpId,
                pkpPublicKey: squallet.pkp[0].pkpPublicKey,
            },
            signer,
            chain?.id,
            squallet.pkp[0].actions[0].cid,
            {
                debug: true,
            },
        );
    }, [squallet, chain, signer]);
    return (
        <SqualletClientContext.Provider value={squalletClient || null}>
            {children}
        </SqualletClientContext.Provider>
    );
};
