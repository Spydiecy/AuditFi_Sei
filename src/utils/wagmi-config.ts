import { QueryClient } from "@tanstack/react-query";
import { http, createConfig } from "wagmi";
import { lineaSepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

// Debug the MetaMask connector
const connector = metaMask();
console.log("MetaMask connector created:", connector);

// Create custom chain definition with proper RPC URL
const customLineaSepolia = {
  ...lineaSepolia,
  id: 59141, // Linea Sepolia chain ID
  name: 'Linea Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.linea.build'] },
    public: { http: ['https://rpc.sepolia.linea.build'] },
  }
};

export const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  ssr: true,
  chains: [customLineaSepolia],
  connectors: [connector],
  transports: {
    [customLineaSepolia.id]: http(),
  },
});

// Debug the created config
console.log("Wagmi config created with chains:", wagmiConfig.chains);
console.log("Wagmi config connectors:", wagmiConfig.connectors); 