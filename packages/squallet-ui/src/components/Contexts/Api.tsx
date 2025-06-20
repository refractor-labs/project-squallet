import { Configuration, TransactionsApi, TransfersApi, WatchApi } from '@refractor-labs/api-client';
import { ReactNode, createContext } from 'react';

export const ApiContext = createContext<{
    transactionsApi: TransactionsApi;
    transfersApi: TransfersApi;
    watchApi: WatchApi;
} | null>(null);

type Props = {
    children: ReactNode;
};

const config = new Configuration({
    basePath: 'https://api.lore.xyz',
    apiKey: process.env.NEXT_PUBLIC_API_TOKEN,
});
const transactionsApi = new TransactionsApi(config);
const transfersApi = new TransfersApi(config);
const watchApi = new WatchApi(config);

export const ApiProvider = ({ children }: Props) => {
    return (
        <ApiContext.Provider value={{ transactionsApi, transfersApi, watchApi }}>
            {children}
        </ApiContext.Provider>
    );
};
