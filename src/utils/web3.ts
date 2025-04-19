import { ethers } from 'ethers';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';

// Define interfaces for better type safety
interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

interface ChainConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: NativeCurrency;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  iconPath: string;
}

export const CHAIN_CONFIG: Record<string, ChainConfig> = {
  seiTestnet: {
    chainId: '0x530', // 1328 in hex
    chainName: 'Sei Testnet',
    nativeCurrency: {
      name: 'Sei',
      symbol: 'SEI',
      decimals: 18
    },
    rpcUrls: ['https://evm-rpc-testnet.sei-apis.com'],
    blockExplorerUrls: ['https://testnet.seistream.app'],
    iconPath: '/chains/sei.png'
  },
  seiMainnet: {
    chainId: '0x531', // 1329 in hex
    chainName: 'Sei Mainnet',
    nativeCurrency: {
      name: 'Sei',
      symbol: 'SEI',
      decimals: 18
    },
    rpcUrls: ['https://evm-rpc.sei-apis.com'],
    blockExplorerUrls: ['https://seistream.app'],
    iconPath: '/chains/sei.png'
  }
} as const;

export type ChainKey = keyof typeof CHAIN_CONFIG;
interface WalletConnection {
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
  address: string;
}

interface EthereumError extends Error {
  code: number;
}

// This is now a hook-based implementation for use within React components
// The actual connection is managed by RainbowKit
export const useWalletConnection = (): { connect: () => Promise<WalletConnection | null> } => {
  const { address, isConnected } = useAccount();
  
  const connect = async (): Promise<WalletConnection | null> => {
    try {
      if (!isConnected || !address) {
        return null;
      }
      
      // If window.ethereum is available, use it to create a provider
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();
        
        return {
          provider,
          signer,
          address
        };
      } else {
        console.warn('No Ethereum provider available');
        return null;
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    }
  };
  
  return { connect };
};

// Legacy function for backward compatibility
export const connectWallet = async (): Promise<WalletConnection> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum provider available');
  }
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return { provider, signer, address };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const switchNetwork = async (chainKey: ChainKey): Promise<void> => {
  // With RainbowKit, network switching is handled automatically by the UI
  // This function is kept for compatibility with existing code
  console.log('Network switching is now handled by RainbowKit UI');
  return Promise.resolve();
};

export const isSupportedNetwork = (chainId: string): boolean => {
  return Object.values(CHAIN_CONFIG).some(
    chain => chain.chainId.toLowerCase() === chainId.toLowerCase()
  );
};