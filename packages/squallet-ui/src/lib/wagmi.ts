import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { infuraProvider } from '@wagmi/core/providers/infura';
import { configureChains, createClient as createWagmiClient } from 'wagmi';
import { mainnet, goerli, polygon, polygonMumbai } from 'wagmi/chains';
import {
    coinbaseWallet,
    injectedWallet,
    metaMaskWallet,
    rainbowWallet,
    walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';

const sepolia = {
    id: 11155111,
    network: 'sepolia',
    name: 'Sepolia',
    nativeCurrency: {
        name: 'Sepolia Ether',
        symbol: 'SEP',
        decimals: 18,
    },
    rpcUrls: {
        infura: {
            http: ['https://sepolia.infura.io/v3'],
            webSocket: ['wss://sepolia.infura.io/ws/v3'],
        },
        default: {
            http: ['https://rpc.sepolia.org'],
        },
        public: {
            http: ['https://rpc.sepolia.org'],
        },
    },
    blockExplorers: {
        etherscan: {
            name: 'Etherscan',
            url: 'https://sepolia.etherscan.io',
        },
        default: {
            name: 'Etherscan',
            url: 'https://sepolia.etherscan.io',
        },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11' as `0x${string}`,
            blockCreated: 6507670,
        },
    },
    testnet: true,
};

const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY as string;
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

export const { chains, provider, webSocketProvider } = configureChains(
    [mainnet, polygon, polygonMumbai, goerli, sepolia],
    [infuraProvider({ apiKey: INFURA_KEY })],
);

const connectors = connectorsForWallets([
    {
        groupName: 'Recommended',
        wallets: [
            injectedWallet({ chains }),
            metaMaskWallet({ chains, projectId }),
            coinbaseWallet({ chains, appName: 'Lore.xyz' }),
            rainbowWallet({ chains, projectId }),
            walletConnectWallet({ chains, projectId }),
        ],
    },
]);

export const wagmiClient = () =>
    createWagmiClient({
        autoConnect: true,
        connectors,
        provider,
        webSocketProvider,
    });
