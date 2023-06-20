import { Chain } from "wagmi";

export const chronicleChain = {
  id: 175177,
  network: 'chronicle',
  name: 'Chronicle - Lit Protocol Testnet',
  nativeCurrency: {
    name: 'LIT',
    symbol: 'LIT',
    decimals: 18
  },
  rpcUrls: {
    infura: {
      http: ['https://chain-rpc.litprotocol.com/http'],
      // webSocket: ['wss://sepolia.infura.io/ws/v3']
    },
    default: {
      http: ['https://chain-rpc.litprotocol.com/http']
    },
    public: {
      http: ['https://chain-rpc.litprotocol.com/http']
    }
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://chain.litprotocol.com/'
    }
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11' as `0x${string}`,
      blockCreated: 6507670
    }
  },
  testnet: true
} as const satisfies Chain
