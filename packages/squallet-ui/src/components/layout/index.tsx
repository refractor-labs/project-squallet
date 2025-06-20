import { trpc } from '../../utils/trpc';
import { MarketingFooter, AppHeader, Switch } from '@refractor-labs/design-system-vite';
import { ReactNode, useEffect, useState } from 'react';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Sidebar from './sidebar';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { Squallet } from '../Contexts/Squallet';
import { SqualletClient } from '../Contexts/SqualletClient';

type Props = {
    children: ReactNode;
};

export default function Layout({ children }: Props) {
    const { query } = useRouter();
    const squalletId = query.squalletId as string;
    const { theme, setTheme } = useTheme();
    const [checked, setChecked] = useState<boolean>(false);
    const { address } = useAccount();

    trpc.user.get.useQuery(
        {
            address: address || '',
        },
        {
            enabled: !!address,
        },
    );
    useEffect(() => {
        if (theme === 'dark') {
            setChecked(true);
        } else {
            setChecked(false);
        }
    }, [theme]);

    return (
        <>
            <AppHeader
                button={
                    <div className="flex items-center gap-4 ">
                        <Switch
                            checked={checked}
                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                        />
                        <ConnectButton />
                    </div>
                }
            ></AppHeader>
            <div className="flex">
                <Squallet>
                    <SqualletClient>
                        <div>{squalletId && <Sidebar squalletId={squalletId} />}</div>
                        <div className="w-11/12 my-40 mx-auto md:w-1/2 ">{children}</div>
                    </SqualletClient>
                </Squallet>
            </div>
            <div className="relative z-[100]">
                <MarketingFooter logo={<></>} />
            </div>
        </>
    );
}
