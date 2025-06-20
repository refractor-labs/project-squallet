import { useRouter } from 'next/router';
import { ReactNode, createContext } from 'react';
import { SqualletDetailed } from 'src/types';
import { trpc } from 'src/utils/trpc';

export const SqualletContext = createContext<SqualletDetailed | null>(null);

type Props = {
    children: ReactNode;
};

export const Squallet = ({ children }: Props) => {
    const { query } = useRouter();
    const { squalletId } = query;
    const { data } = trpc.squallet.get.useQuery(
        {
            id: squalletId as string,
        },
        {
            enabled: !!squalletId,
        },
    );
    if (squalletId && !data) {
        return null;
    }

    return <SqualletContext.Provider value={data || null}>{children}</SqualletContext.Provider>;
};
