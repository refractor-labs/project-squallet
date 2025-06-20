import { Button } from '@refractor-labs/prysm-design-system';
import { useContext, useState, useEffect } from 'react';
import { ApiContext } from 'src/components/Contexts/Api';
import { SqualletContext } from 'src/components/Contexts/Squallet';
import ToggleButton from 'src/components/ToggleButton';
import {
    PaginatedTotalTransferResponse,
    PaginatedTotalTxResponse,
} from '@refractor-labs/api-client';
import TransferCard from 'src/components/Cards/TransferCard';
import { Pagination } from '@refractor-labs/design-system-vite';
import TransactionCard from 'src/components/Cards/TransactionCard';

export default function Home() {
    const [selected, setSelected] = useState<'transactions' | 'transfers'>('transactions');

    const [transactionsData, setTransactionsData] = useState<PaginatedTotalTxResponse | null>(null);
    const [transfersData, setTransfersData] = useState<PaginatedTotalTransferResponse | null>(null);
    const [limit, setLimit] = useState<number>(10);
    const [page, setPage] = useState<number>(0);
    const [, setTotal] = useState<number | undefined>(undefined);
    const [, setLoading] = useState<boolean>(true);

    const api = useContext(ApiContext);
    const squallet = useContext(SqualletContext);

    const getTxLabel = () => {
        const total =
            selected === 'transactions'
                ? transactionsData?.pagination.total
                : transfersData?.pagination.total;

        if (!total) {
            return;
        }
        if (selected === 'transactions') {
            return `${total} Transaction${total > 1 ? 's' : ''}`;
        } else {
            return `${total} Transfer${total > 1 ? 's' : ''}`;
        }
    };

    useEffect(() => {
        if (!api?.transactionsApi) {
            return;
        }
        (async () => {
            if (selected === 'transactions') {
                const resp = await api.transactionsApi.getTransactions(
                    '0xd0902afbaad98b4288fb767038d78b9273810997', //squallet?.pkp[0]?.pkpAddress || '',
                    undefined,
                    page * limit,
                    limit,
                );
                await setTransactionsData(resp.data);
                await setTotal(transactionsData?.pagination.total);
                setLoading(false);
            } else {
                if (selected === 'transfers') {
                    const resp = await api.transfersApi.getTransfers(
                        '0xd0902afbaad98b4288fb767038d78b9273810997', //squallet?.pkp[0]?.pkpAddress || '',
                        page * limit,
                        limit,
                    );
                    setTransfersData(resp.data);
                    setTotal(transfersData?.pagination.total);
                    setLoading(false);
                }
            }
        })();
    }, [api?.transactionsApi, squallet?.pkp[0]?.pkpAddress, page, limit, selected]);

    return (
        <>
            <div className="min-h-screen">
                <div className="flex flex-col gap-4">
                    <span className="text-default-focus text-3xl font-bold">Transactions</span>

                    <ToggleButton
                        primaryOption="Transactions"
                        secondaryOption="Transfers"
                        selected={selected === 'transactions'}
                        onClick={() =>
                            setSelected(selected === 'transactions' ? 'transfers' : 'transactions')
                        }
                    ></ToggleButton>

                    <div className="flex justify-between">
                        <span className="text-default-focus text-3xl font-bold ">
                            {getTxLabel()}
                        </span>
                        <div className="flex gap-4">
                            <Button>Filters</Button>
                            <Button>Download CSV</Button>
                        </div>
                    </div>

                    {transactionsData &&
                        selected === 'transactions' &&
                        transactionsData?.data.map((transaction, i) => (
                            <TransactionCard key={i} transaction={transaction} />
                        ))}

                    <div className="flex flex-col my-2">
                        {transfersData &&
                            selected === 'transfers' &&
                            transfersData?.data.map((transfer, i) => (
                                <TransferCard key={i} transfer={transfer} />
                            ))}
                    </div>
                </div>

                {transactionsData &&
                    transactionsData.pagination.total > 10 &&
                    selected === 'transactions' && (
                        <Pagination
                            hasPreviousPage={page > 0}
                            hasNextPage={
                                page < Math.ceil(transactionsData.pagination.total / limit) - 1
                            }
                            className="justify-between mt-4"
                            firstItemIndex={page * limit + 1}
                            lastItemIndex={page * limit + limit}
                            totalItemCount={transactionsData.pagination.total}
                            hasContentCount={true}
                            onContentCountChange={(value) => setLimit(parseInt(value, 10))}
                            contentCountDefault={limit.toString()}
                            onFirstPageClick={() => setPage(0)}
                            onNextPageClick={() => {
                                setPage((prevPage) => prevPage + 1);
                            }}
                            onPreviousPageClick={() => {
                                setPage((prevPage) => prevPage - 1);
                            }}
                            onLastPageClick={() => {
                                setPage(Math.ceil(transactionsData.pagination.total / limit) - 1);
                            }}
                        />
                    )}

                {transfersData &&
                    transfersData.pagination.total > 10 &&
                    selected === 'transfers' && (
                        <Pagination
                            hasPreviousPage={page > 0}
                            hasNextPage={
                                page < Math.ceil(transfersData.pagination.total / limit) - 1
                            }
                            className="justify-between mt-4"
                            hasContentCount={true}
                            onContentCountChange={(value) => {
                                setLimit(parseInt(value, 10));
                                setPage(0);
                            }}
                            contentCountDefault={limit.toString()}
                            firstItemIndex={page * limit + 1}
                            lastItemIndex={page * limit + limit}
                            totalItemCount={transfersData.pagination.total}
                            onFirstPageClick={() => setPage(0)}
                            onNextPageClick={() => {
                                setPage((prevPage) => prevPage + 1);
                            }}
                            onPreviousPageClick={() => {
                                setPage((prevPage) => prevPage - 1);
                            }}
                            onLastPageClick={() => {
                                setPage(Math.ceil(transfersData.pagination.total / limit) - 1);
                            }}
                        />
                    )}
            </div>
        </>
    );
}
