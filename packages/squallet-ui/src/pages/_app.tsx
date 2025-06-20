import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { darkTheme, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { themes } from '@refractor-labs/prysm-design-system';
import { ThemeProvider, useTheme } from 'next-themes';
import { WagmiConfig } from 'wagmi';
import { chains, wagmiClient } from '../lib/wagmi';
import { memo, useEffect, useMemo, useState } from 'react';
import { createClient } from '@liveblocks/client';
import { LiveblocksProvider } from '@liveblocks/react';
import '@refractor-labs/design-system-vite/dist/style.css';
import Layout from 'src/components/layout';
import { trpc } from '../utils/trpc';
import { ApiProvider } from 'src/components/Contexts/Api';

const client = createClient({
    publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

const ThemeDetector = () => {
    const { theme } = useTheme();

    const memoizedTheme = useMemo(() => theme, [theme]);

    useEffect(() => {
        if (memoizedTheme) {
            document.documentElement.dataset.theme = theme;
            document.documentElement.dataset.frTheme = theme;
            document.documentElement.dataset.frScheme = theme;
        }
    }, [memoizedTheme]);

    return null;
};

const MemoizedThemeDetector = memo(ThemeDetector);

function App({ Component, pageProps }: AppProps) {
    const { theme } = useTheme();
    return (
        <WagmiConfig client={wagmiClient()}>
            <RainbowKitProvider
                theme={{
                    lightMode: lightTheme(),
                    darkMode: darkTheme(),
                }}
                chains={chains}
            >
                <LiveblocksProvider client={client}>
                    <ApiProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="dark"
                            value={{
                                dark: themes.night,
                                light: themes.light,
                            }}
                        >
                            <MemoizedThemeDetector />
                            <Layout>
                                <Component {...pageProps} />
                            </Layout>
                        </ThemeProvider>
                    </ApiProvider>
                </LiveblocksProvider>
            </RainbowKitProvider>
        </WagmiConfig>
    );
}

export default trpc.withTRPC(App);
