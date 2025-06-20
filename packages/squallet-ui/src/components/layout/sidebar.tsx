import {
    Icons,
    NavigationSquads,
    Badge,
    MobileFooter,
    Button,
} from '@refractor-labs/design-system-vite';
import { useContext, useEffect, useReducer, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { trpc } from 'src/utils/trpc';
import { SqualletContext } from '../Contexts/Squallet';

type Props = {
    squalletId: string;
};

export default function Sidebar({ squalletId }: Props) {
    const router = useRouter();
    const [openMobile, setOpenMobile] = useState(false);
    const [expanded, toggleIsExpanded] = useReducer((state) => {
        return !state;
    }, false);

    const fetchProposalCount = trpc.proposal.count.useQuery({ squalletId });
    const { data: proposalCount } = fetchProposalCount;
    const squallet = useContext(SqualletContext);
    const signerCount = squallet?.users.length;

    useEffect(() => {
        if (openMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'visible';
        }
    }, [openMobile]);

    return (
        <>
            <NavigationSquads
                header={
                    <>
                        <div className="rounded-full overflow-hidden flex-shrink-0"></div>
                        {`Sample Name`}
                    </>
                }
                openMobile={openMobile}
                showAuthControls={true}
                setOpenMobile={setOpenMobile}
                onExpandClick={toggleIsExpanded}
                showExpand={true}
            >
                <NavigationSquads.Item
                    onItemClick={() => {
                        document.dispatchEvent(
                            new KeyboardEvent('keydown', {
                                key: 'k',
                                metaKey: true,
                            }),
                        );
                    }}
                    badge={
                        <div className="flex gap-2">
                            <Badge intent="default">
                                <Icons.command size={10} />
                            </Badge>
                            <Badge intent="default">K</Badge>
                        </div>
                    }
                    icon="search"
                >
                    Search
                </NavigationSquads.Item>
                <NavigationSquads.Separator />
                <Link passHref href={`/squallets/${squalletId}`}>
                    <NavigationSquads.Item
                        active={router?.route === `/squallets/${squalletId}`}
                        icon="home"
                    >
                        Home
                    </NavigationSquads.Item>
                </Link>

                <Link passHref href={`/squallets/${squalletId}/signers`} legacyBehavior>
                    <NavigationSquads.Item
                        badge={
                            <>
                                <Badge intent="blue">{signerCount}</Badge>
                            </>
                        }
                        active={router?.route === `/squallets/${squalletId}/signers`}
                        icon="calendar"
                    >
                        Signers
                    </NavigationSquads.Item>
                </Link>

                <Link passHref href={`/squallets/${squalletId}/proposals`} legacyBehavior>
                    <NavigationSquads.Item
                        badge={
                            <>
                                <Badge intent="blue">{proposalCount}</Badge>
                            </>
                        }
                        active={router?.route === `/squallets/${squalletId}/proposals`}
                        icon="calendar"
                    >
                        Proposals
                    </NavigationSquads.Item>
                </Link>
                <Link passHref href={`/squallets/${squalletId}/portfolio`} legacyBehavior>
                    <NavigationSquads.Item
                        active={router?.route === `/squallets/${squalletId}/portfolio`}
                        icon="media"
                    >
                        Portfolio
                    </NavigationSquads.Item>
                </Link>

                <Link passHref href={`/squallets/${squalletId}/transactions`} legacyBehavior>
                    <NavigationSquads.Item
                        active={router?.route === `/squallets/${squalletId}/transactions`}
                        icon="link"
                    >
                        Transactions
                    </NavigationSquads.Item>
                </Link>
                <Link passHref href={`/squallets/${squalletId}/settings`} legacyBehavior>
                    <NavigationSquads.Item
                        icon="settings"
                        active={router?.route === `/squallets/${squalletId}/settings`}
                    >
                        Settings
                    </NavigationSquads.Item>
                </Link>

                <NavigationSquads.Separator />
                <NavigationSquads.ButtonGroup>
                    <Link href={`#`} legacyBehavior>
                        <Button>
                            <Image
                                alt="WalletConnect logo"
                                height={16}
                                width={16}
                                src={'/images/wallet-connect.svg'}
                            />
                            Connect to dApp
                        </Button>
                    </Link>
                </NavigationSquads.ButtonGroup>
            </NavigationSquads>
            <MobileFooter>
                <Link href={`/`} legacyBehavior>
                    <MobileFooter.Item
                        onItemClick={() => {
                            router.push(`/`);
                        }}
                    >
                        Home
                    </MobileFooter.Item>
                </Link>

                <MobileFooter.Item
                    onItemClick={() => {
                        setOpenMobile(true);
                    }}
                >
                    <Icons.moreHorizontal />
                    More
                </MobileFooter.Item>
            </MobileFooter>
        </>
    );
}
