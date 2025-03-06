// ContractBuilder.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mistral } from "@mistralai/mistralai";
import { z } from "zod";
import { ethers } from 'ethers';
import {
  FileCode,
  Robot,
  CircleNotch,
  Copy,
  Check,
  Rocket,
  Link,
  Code
} from 'phosphor-react';
import { CONTRACT_TEMPLATES, ContractTemplate } from './templates';
import { connectWallet, CHAIN_CONFIG } from '@/utils/web3';
import React from 'react';

// Initialize Mistral client
const mistralClient = new Mistral({
  apiKey: process.env.NEXT_PUBLIC_MISTRAL_API_KEY!
});

// Define response schema
const ContractSchema = z.object({
  code: z.string(),
  features: z.array(z.string()),
  securityNotes: z.array(z.string())
});

export default function ContractBuilder() {
  // Template and code generation state
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [customFeatures, setCustomFeatures] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractParams, setContractParams] = useState<Record<string, string>>({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [copySuccess, setCopySuccess] = useState(false);

  // Deployment state
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentChain, setCurrentChain] = useState<keyof typeof CHAIN_CONFIG | null>(null);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [securityNotes, setSecurityNotes] = useState<string[]>([]);

  // State for manual code input in generated code
  const [manualCode, setManualCode] = useState('');

  // Use manualCode if generatedCode is empty, otherwise use generatedCode
  const displayedCode = generatedCode || manualCode;

  // Function to handle changes in manual code input
  const handleManualCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setManualCode(e.target.value);
    // Clear generatedCode when manually typing
    setGeneratedCode('');
  };

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum && (await (window.ethereum.request({ method: 'eth_accounts' }) as Promise<string[]>)).length > 0) {
        try {
          const { provider } = await connectWallet();
          const network = await provider.getNetwork();
          const chainId = '0x' + network.chainId.toString(16);

          // Only check for Electroneum Network
          if (chainId.toLowerCase() === CHAIN_CONFIG.electroneumMainnet.chainId.toLowerCase()) {
            setCurrentChain('electroneumMainnet');
            setWalletConnected(true);
          }
        } catch (error) {
          console.error('Error checking wallet:', error);
        }
      }
    };

    checkWallet();
  }, []);

  // Update contract parameters when template changes
  useEffect(() => {
    if (selectedTemplate?.defaultParams) {
      setContractParams(selectedTemplate.defaultParams);
      setGeneratedCode(selectedTemplate.baseCode);
    } else {
      setContractParams({});
      setGeneratedCode('');
    }
  }, [selectedTemplate]);

  // Track mouse position for gradient effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate contract code using Mistral AI
  const generateContract = async () => {
    if (!selectedTemplate) return;
    setIsGenerating(true);
    setError(null);

    try {
      const response = await mistralClient.chat.complete({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: `You are an expert Solidity developer. Generate a secure and optimized smart contract based on these requirements:

        Important Rules:
        1. Use Solidity version 0.8.19
        2. DO NOT use ANY external imports or libraries
        3. Include all necessary functionality directly in the contract
        4. Add proper access control and safety checks
        5. Include events for all state changes
        6. Implement comprehensive security measures
        7. Add gas optimizations
        8. Return response in exact JSON format
        
        Security Considerations:
        - Include reentrancy guards where needed
        - Add proper access control
        - Implement input validation
        - Add checks for integer overflow
        - Validate addresses
        - Include event emissions
        - Handle edge cases`
          },
          {
            role: "user",
            content: `Generate a contract with these specifications:
        Template: ${selectedTemplate.name}
        Base Code: ${selectedTemplate.baseCode || 'Create new contract'}
        Custom Features: ${customFeatures || 'Standard features'}
        Parameters: ${JSON.stringify(contractParams)}
        
        Return in this exact format:
        {
          "code": "complete solidity code",
          "features": ["list of implemented features"],
          "securityNotes": ["list of security measures implemented"]
        }`
          }
        ],
        responseFormat: { type: "json_object" },
        temperature: 0.1,
        maxTokens: 4096
      });

      const responseText = response.choices?.[0]?.message?.content || '';
      const parsedResponse = JSON.parse(typeof responseText === 'string' ? responseText : '');

      // Validate response against schema
      const validatedResponse = ContractSchema.parse(parsedResponse);

      setGeneratedCode(validatedResponse.code);
      setSecurityNotes(validatedResponse.securityNotes);
    } catch (error) {
      console.error('Generation failed:', error);
      setError('Failed to generate contract. Please try again.');
      if (selectedTemplate.baseCode) {
        setGeneratedCode(selectedTemplate.baseCode);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Deploy the generated contract
  const deployContract = async () => {
    if (!displayedCode || !walletConnected) return;

    setIsDeploying(true);
    setDeploymentError(null);

    try {
      const { provider, signer } = await connectWallet();

      // Verify we're on Electroneum Network
      const network = await provider.getNetwork();
      const chainId = '0x' + network.chainId.toString(16);

      if (chainId.toLowerCase() !== CHAIN_CONFIG.electroneumMainnet.chainId.toLowerCase()) {
        throw new Error('Please switch to Electroneum Network Testnet');
      }

      // Compile contract
      const response = await fetch('/api/compile-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode: displayedCode }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Compilation failed: ${error}`);
      }

      const { abi, bytecode } = await response.json();

      // Create contract factory
      const contractFactory = new ethers.ContractFactory(abi, bytecode, signer);

      // Process constructor arguments
      const constructorAbi = abi.find((item: any) => item.type === 'constructor');
      const constructorArgs = Object.values(contractParams).map((value, index) => {
        const input = constructorAbi?.inputs?.[index];

        if (!input) return value;

        switch (input.type) {
          case 'uint256':
            return ethers.parseUnits(value.toString(), 18);
          case 'address':
            if (!ethers.isAddress(value)) {
              throw new Error(`Invalid address for parameter ${input.name}`);
            }
            return value;
          default:
            return value;
        }
      });

      // Deploy contract
      const contract = await contractFactory.deploy(...constructorArgs);
      const receipt = await contract.deploymentTransaction()?.wait();

      if (!receipt?.contractAddress) {
        throw new Error('Failed to get contract address');
      }

      setDeployedAddress(receipt.contractAddress);

    } catch (error: any) {
      console.error('Deployment failed:', error);
      setDeploymentError(error.message || 'Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  // Helper functions
  const getExplorerUrl = () => {
    if (!currentChain || !deployedAddress) return null;
    const baseUrl = CHAIN_CONFIG[currentChain].blockExplorerUrls[0];
    return `${baseUrl}/address/${deployedAddress}`;
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      setWalletConnected(true);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-zinc-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold mb-4 text-emerald-400">Smart Contract Builder</h1>
          <p className="text-gray-400">Generate and deploy secure smart contracts on Electroneum Network</p>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          {deployedAddress && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-1">Contract deployed successfully!</p>
                  <p className="text-sm font-mono">{deployedAddress}</p>
                </div>
                <a
                  href={getExplorerUrl() || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
                >
                  <Link size={20} />
                  View on Explorer
                </a>
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Templates and Parameters */}
          <div className="flex flex-col space-y-4">
            {/* Template Selection */}
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Robot className="text-emerald-400" size={20} />
                <span className="font-mono text-white">Contract Templates</span>
              </div>

              <div className="space-y-4">
                {CONTRACT_TEMPLATES.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full p-4 rounded-lg border transition-colors duration-200 text-left
                      ${selectedTemplate?.name === template.name
                        ? 'border-emerald-500 bg-emerald-500/10 text-white'
                        : 'border-gray-800 hover:border-emerald-500/50'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-emerald-400">{template.icon}</div>
                      <span className="font-semibold text-white">{template.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button - Moved Here */}
            <button
              onClick={generateContract}
              disabled={!selectedTemplate || isGenerating}
              className={`w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-200 ${isGenerating || !selectedTemplate
                ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 text-black'
                }`}
            >
              {isGenerating ? (
                <>
                  <CircleNotch className="animate-spin" size={20} />
                  Generating...
                </>
              ) : (
                <>
                  <Robot size={20} />
                  Generate Contract
                </>
              )}
            </button>

            {/* Parameters Form */}
            {selectedTemplate && (
              <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="text-emerald-400" size={20} />
                  <span className="font-mono text-white">Contract Parameters</span>
                </div>

                <div className="p-6">
                  {Object.entries(contractParams).map(([key, value]) => (
                    <div key={key} className="mb-4">
                      <label className="text-sm text-gray-400 mb-1 block">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          setContractParams((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        className="w-full bg-transparent rounded-lg border border-gray-700 p-2 text-white focus:outline-none"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      Custom Features
                    </label>
                    <textarea
                      value={customFeatures}
                      onChange={(e) => setCustomFeatures(e.target.value)}
                      placeholder="Describe additional features..."
                      className="w-full h-24 bg-transparent rounded-lg border border-gray-700 p-2 text-white resize-none focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Code Display and Deployment */}
          <div className="flex flex-col">
            <div className="flex-1 bg-gray-900/50 rounded-lg border border-gray-800">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileCode className="text-emerald-400" size={20} />
                  <span className="font-mono text-white">Generated Contract</span>
                </div>
                {displayedCode && (
                  <button
                    onClick={() => copyToClipboard(displayedCode)}
                    className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1"
                  >
                    {copySuccess ? <Check size={16} /> : <Copy size={16} />}
                    {copySuccess ? 'Copied!' : 'Copy Code'}
                  </button>
                )}
              </div>

              <div className="code-container">
                {displayedCode ? (
                  <>
                    <div className="line-numbers">
                      {Array.from({ length: displayedCode.split('\n').length }, (_, i) => i + 1).map(lineNumber => (
                        <span key={lineNumber} className="line-number">
                          {lineNumber}
                        </span>
                      ))}
                    </div>
                    <textarea
                      value={displayedCode}
                      onChange={handleManualCodeChange}
                      className="code-input font-mono text-sm text-white bg-transparent border-none resize-none outline-none p-4 w-full h-full absolute top-0 left-0 overflow-y-scroll"
                    />
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Robot size={48} className="mb-4" />
                    <p>Select a template and generate your contract to see the code here</p>
                  </div>
                )}
              </div>
            </div>
            {displayedCode && (
              <div className="border-t border-gray-700 p-4">
                {!walletConnected ? (
                  <button
                    onClick={handleConnectWallet}
                    className="w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black transition-colors duration-200"
                  >
                    <Robot size={20} />
                    Connect Wallet to Deploy
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      <span>Network:</span>
                      <span className="text-white font-mono">Electroneum Network Testnet</span>
                    </div>

                    <button
                      onClick={deployContract}
                      disabled={isDeploying}
                      className={`w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors duration-200
                        ${isDeploying
                          ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-black'
                        }`}
                    >
                      {isDeploying ? (
                        <>
                          <CircleNotch className="animate-spin" size={20} />
                          Deploying Contract...
                        </>
                      ) : (
                        <>
                          <Rocket size={20} />
                          Deploy Contract
                        </>
                      )}
                    </button>
                    {deploymentError && (
                      <div className="mt-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        {deploymentError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .code-container {
          position: relative;
          width: 100%;
          height: 600px; /* Set a fixed height for the container */
        }

        .line-numbers {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          padding: 4px;
          text-align: right;
          color: #6b7280;
          font-size: 14px;
          font-family: monospace;
          white-space: nowrap;
          overflow-y: auto; /* Add vertical scroll for line numbers */
          z-index: 1;
          background-color: #374151;
          border-right: 1px solid #4b5563;
        }

        .line-number {
          display: block;
          padding: 0 8px;
        }

        .code-input {
          padding-left: 50px; /* Adjust based on line number width */
          z-index: 2;
          height: 100%;
        }
      `}</style>
    </div>
  );
}