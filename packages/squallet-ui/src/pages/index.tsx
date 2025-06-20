import { Button, Modal, Toast } from '@refractor-labs/design-system-vite';
import { motion } from 'framer-motion';
import { useTokenCookie } from 'hooks/useTokenCookie';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SqualletForm } from 'src/components/Forms/SqualletForm';
import { GenesisHands } from 'src/illustrations/Hero/GenesisHands';
import { trpc } from 'src/utils/trpc';
import { useAccount } from 'wagmi';
import SqualletCard from '../components/Cards/SqualletCard';

const HomePageLayout = () => {
    const { address, isConnected } = useAccount();
    const [open, setOpen] = useState<boolean>(false);
    const [openToast, setOpenToast] = useState<boolean>(false);
    const [creating, setCreating] = useState<boolean>(false);
    const handleFailure = (e) => {
        console.log(e);
        setOpenToast(true);
    };
    const { generateToken } = useTokenCookie();

    const squallets = trpc.squallet.list.useQuery(
        { address: address as string },
        { enabled: !!address },
    );
    const { data } = squallets;

    const createSquallet = async () => {
        try {
            const token = await generateToken();
            setOpen(true);
            setCreating(true);
        } catch (e) {
            handleFailure(e);
            console.log(e);
        }
    };

    return (
        <>
            <div className="flex flex-col h-screen">
                <div className="flex-grow">
                    {isConnected ? (
                        <>
                            <div className="flex justify-between">
                                <span className="text-default-focus text-3xl font-bold">
                                    My Squallets
                                </span>
                                <Button
                                    onClick={async () => {
                                        await createSquallet();
                                        setOpenToast(false);
                                    }}
                                >
                                    Create Squallet
                                </Button>
                            </div>
                            <div className="card-grid">
                                <>
                                    {data &&
                                        data.map((squallet) => (
                                            <Link
                                                key={squallet.id}
                                                href={`/squallets/${squallet.id}`}
                                                legacyBehavior
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                >
                                                    <SqualletCard squallet={squallet} />
                                                </motion.div>
                                            </Link>
                                        ))}
                                </>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col items-center justify-center">
                                <>
                                    <GenesisHands />

                                    <span className="text-default text-body-md">
                                        Please connect your wallet to continue
                                    </span>
                                </>
                            </div>
                        </>
                    )}
                    <div className="fixed inset-x-0 bottom-12 flex items-end justify-center">
                        {openToast && (
                            <Toast.Root variants={{ type: 'failure' }}>
                                <Toast.Description>Check console for error</Toast.Description>
                            </Toast.Root>
                        )}
                    </div>
                </div>
                <Modal title="Create Squallet" open={open} onOpenChange={setOpen}>
                    <SqualletForm onOpenChange={setOpen} onFailure={handleFailure} />
                </Modal>
            </div>
        </>
    );
};

function Home() {
    const [rendered, setRendered] = useState(false);

    // Prevents hydration mismatch for not being connected with wallet
    useEffect(() => {
        setRendered(true);
    }, []);

    return <>{rendered && <HomePageLayout />}</>;
}

export default Home;
