// utils/web3.ts
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum: any;
  }
}

export const CHAIN_CONFIG = {
  lineaSepolia: {
    chainId: '0xE705', // 59141 in hex
    chainName: 'Linea Sepolia',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.linea.build'],
    blockExplorerUrls: ['https://sepolia.lineascan.build/'],
    iconPath: '/chains/linea.png'
  },
  neoX: {
    chainId: '0xBA9304', // 12227332 in hex
    chainName: 'Neo X TestNet',
    nativeCurrency: { name: 'GAS', symbol: 'GAS', decimals: 18 },
    rpcUrls: ['https://neoxt4seed1.ngd.network'],
    blockExplorerUrls: ['https://xt4scan.ngd.network/'],
    iconPath: '/chains/neox.png'
  }
};

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return { provider, signer, address };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const switchNetwork = async (chainKey: keyof typeof CHAIN_CONFIG) => {
  const chain = CHAIN_CONFIG[chainKey];
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chain.chainId }],
    });
  } catch (switchError: any) {
    // This error code means the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chain.chainId,
            chainName: chain.chainName,
            nativeCurrency: chain.nativeCurrency,
            rpcUrls: chain.rpcUrls,
            blockExplorerUrls: chain.blockExplorerUrls
          }],
        });
      } catch (addError) {
        console.error('Error adding chain:', addError);
        throw addError;
      }
    } else {
      console.error('Error switching chain:', switchError);
      throw switchError;
    }
  }
};

// Optional: Add a function to check if a network is supported
export const isSupportedNetwork = (chainId: string): boolean => {
  return Object.values(CHAIN_CONFIG).some(
    chain => chain.chainId.toLowerCase() === chainId.toLowerCase()
  );
};