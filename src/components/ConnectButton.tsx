import { SignOut } from '@phosphor-icons/react';
import { useAccount, useConnect, useDisconnect } from "wagmi";
import Image from 'next/image';

export const ConnectButton = () => {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Format address for display
  const formattedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  return (
    <div>
      {address ? (
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-dark-100 hover:bg-dark-200 text-white font-bold rounded-lg transition-all duration-200 shadow-md flex items-center gap-2"
        >
          <SignOut weight="bold" className="w-4 h-4" />
          {formattedAddress}
        </button>
      ) : (
        connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            className="px-4 py-2 bg-dark-100 hover:bg-dark-200 text-white font-bold rounded-lg transition-all duration-200 shadow-md flex items-center gap-2"
          >
            <Image 
              src="/chains/metamask.svg" 
              alt="MetaMask" 
              width={20} 
              height={20} 
            />
            Connect Wallet
          </button>
        ))
      )}
    </div>
  );
}; 