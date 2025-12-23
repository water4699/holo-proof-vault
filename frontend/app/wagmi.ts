import { http, createConfig } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Use simple injected connector (MetaMask) to avoid WalletConnect issues
const localUrl = process.env.NEXT_PUBLIC_LOCAL_RPC_URL || 'http://127.0.0.1:8545';
const sepoliaUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 
  `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY || '8f7d90378a814251afabcf6425269276'}`;

export const config = createConfig({
  chains: [hardhat, sepolia],
  connectors: [
    injected({ target: 'metaMask' }),
  ],
  transports: {
    [hardhat.id]: http(localUrl),
    [sepolia.id]: http(sepoliaUrl),
  },
  ssr: true,
});

// Export getConfig for compatibility
export const getConfig = () => config;
