import { QueryClient } from "@tanstack/react-query";
import { http, createConfig } from "wagmi";
import { seiTestnet } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

// Debug the MetaMask connector
const connector = metaMask();
console.log("MetaMask connector created:", connector);

// Create custom chain definition with proper RPC URL
const customSeiTestnet = {
  ...seiTestnet,
  id: 1328, // Sei testnet chain ID
  name: 'Sei testnet',
  nativeCurrency: {
    name: 'Sei',
    symbol: 'SEI',
    decimals: 18
  },
  rpcUrls: {
    default: { http: ['https://evm-rpc-testnet.sei-apis.com'] },
    public: { http: ['https://evm-rpc-testnet.sei-apis.com'] },
  }
};

export const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  ssr: true,
  chains: [customSeiTestnet],
  connectors: [connector],
  transports: {
    [customSeiTestnet.id]: http(),
  },
});

// Debug the created config
console.log("Wagmi config created with chains:", wagmiConfig.chains);
console.log("Wagmi config connectors:", wagmiConfig.connectors); 