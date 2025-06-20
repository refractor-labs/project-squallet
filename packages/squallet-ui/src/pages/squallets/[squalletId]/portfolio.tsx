import { Button } from '@refractor-labs/design-system-vite';
import Link from 'next/link';
import { useRouter } from 'next/router';

export type Squallet = {
    id: string;
};

export default function Home() {
    const router = useRouter();
    const squalletId = router.query.squalletId;
    return (
        <>
            <div className="min-h-screen">
                <div className="flex justify-between">
                    <span className="text-default-focus text-3xl font-bold">Portfolio</span>
                </div>
            </div>
        </>
    );
}
