import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { SqualletContext } from 'src/components/Contexts/Squallet';
import SignerCard from 'src/components/Cards/SignerCard';
import { Pagination } from '@refractor-labs/design-system-vite';
import { SqualletUserDetailed } from 'src/types';

export type Squallet = {
    id: string;
};

export default function Home() {
    const squallet = useContext(SqualletContext);
    const members = squallet?.users;
    const [limit, setLimit] = useState<number>(10);
    const [page, setPage] = useState<number>(0);
    const [total, setTotal] = useState<number | undefined>(undefined);
    const [pageMembers, setPageMembers] = useState<SqualletUserDetailed[]>([]);

    useEffect(() => {
        if (members) {
            setPageMembers([...members?.slice(page * limit, (page + 1) * limit)]);
        }
    }, [page, limit]);

    if (!members) {
        return null;
    }

    return (
        <>
            <div className="min-h-screen">
                <div className="flex flex-col">
                    <span className="header-md text-default-focus font-bold">Members</span>
                    <span className="text-md text-default">
                        Signer threshold:
                        <span className="text-default-focus"> {squallet?.threshold} </span>
                        of<span className="text-default-focus"> {squallet?.users.length}</span>
                    </span>
                    <div className="flex flex-col my-6 gap-6">
                        <>
                            {squallet?.users.map((user) => (
                                <Link
                                    key={user.id}
                                    href={`/squallets/${squallet?.id}/signers/${user?.id}`}
                                    legacyBehavior
                                >
                                    <SignerCard user={user} />
                                </Link>
                            ))}
                        </>
                    </div>
                </div>
                <Pagination
                    hasPreviousPage={page > 0}
                    hasNextPage={page < Math.ceil(members.length / limit) - 1}
                    className="justify-between mt-4"
                    hasContentCount={true}
                    onContentCountChange={(value) => {
                        setLimit(parseInt(value, 10));
                        setPage(0);
                    }}
                    contentCountDefault={limit.toString()}
                    firstItemIndex={page * limit + 1}
                    lastItemIndex={page * limit + limit}
                    totalItemCount={members.length}
                    onFirstPageClick={() => setPage(0)}
                    onNextPageClick={() => {
                        setPage((prevPage) => prevPage + 1);
                    }}
                    onPreviousPageClick={() => {
                        setPage((prevPage) => prevPage - 1);
                    }}
                    onLastPageClick={() => {
                        setPage(Math.ceil(members.length / limit) - 1);
                    }}
                />
            </div>
        </>
    );
}
