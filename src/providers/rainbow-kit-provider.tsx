'use client';

import { useState, useEffect } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  Theme,
} from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  injectedWallet,
  trustWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { WagmiProvider, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Define Sei Testnet chain
const seiTestnet = {
  id: 1328,
  name: 'Sei Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sei',
    symbol: 'SEI',
  },
  rpcUrls: {
    default: { http: ['https://evm-rpc-testnet.sei-apis.com'] },
  },
  blockExplorers: {
    default: { name: 'Sei Stream', url: 'https://testnet.seistream.app/' },
  },
  testnet: true,
};

// Define Sei Mainnet chain
const seiMainnet = {
  id: 1329,
  name: 'Sei Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sei',
    symbol: 'SEI',
  },
  rpcUrls: {
    default: { http: ['https://evm-rpc.sei-apis.com'] },
  },
  blockExplorers: {
    default: { name: 'Sei Stream', url: 'https://seistream.app' },
  },
  testnet: false,
};

// Contract address on Sei mainnet
const CONTRACT_ADDRESS_MAINNET = '0xCa36dD890F987EDcE1D6D7C74Fb9df627c216BF6';

// Project ID for WalletConnect
// For demo purposes we're using a hardcoded ID, but in production you should use an environment variable
const projectId = 'b8ad206ba9492e6096fa0aa0f868586c';

// Configure the wagmi client with Rainbow Kit
const config = getDefaultConfig({
  appName: 'AuditFi',
  projectId,
  chains: [seiTestnet, seiMainnet], // Include both Sei Testnet and Mainnet
  transports: {
    [seiTestnet.id]: http(),
    [seiMainnet.id]: http(),
  },
  ssr: true, // Enable server-side rendering support
});

// Create a custom theme that matches AuditFi's UI
const auditFiTheme = {
  ...darkTheme(),
  colors: {
    ...darkTheme().colors,
    accentColor: '#3b82f6', // Blue color to match your gradient
    accentColorForeground: 'white',
    connectButtonBackground: '#1e293b', // Darker background
    connectButtonText: 'white',
  },
  radii: {
    ...darkTheme().radii,
    connectButton: '0.5rem', // Rounded corners similar to your UI
  },
} as Theme;

// Create query client for React Query
const queryClient = new QueryClient();

export function RainbowKitProviderWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Handle hydration issue in Next.js and prevent multiple initializations
  useEffect(() => {
    setMounted(true);
    
    // Cleanup function to handle component unmounting
    return () => {
      // Clean up any resources if needed
    };
  }, []);

  // Skip rendering until the component is mounted to prevent hydration errors
  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={auditFiTheme}
          showRecentTransactions={false} // Hide recent transactions
          modalSize="compact"
          appInfo={{
            appName: 'AuditFi',
            learnMoreUrl: 'https://seitrace.com',
          }}
          initialChain={seiTestnet.id} // Always start on Sei Testnet
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
