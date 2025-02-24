'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mistral } from "@mistralai/mistralai";
import { z } from "zod";
import { ethers } from 'ethers';
import { 
  Star,
  Warning,
  CheckCircle,
  FileCode,
  Robot,
  Cube,
  Lock,
  Timer,
  CircleNotch,
  ArrowSquareOut
} from 'phosphor-react';
import { connectWallet } from '@/utils/web3';
import { CONTRACT_ADDRESSES, AUDIT_REGISTRY_ABI } from '@/utils/contracts';
import { CHAIN_CONFIG } from '@/utils/web3';

// Initialize Mistral client
const mistralClient = new Mistral({
  apiKey: process.env.NEXT_PUBLIC_MISTRAL_API_KEY!
});

// Define the vulnerability analysis schema
const VulnerabilitySchema = z.object({
  stars: z.number().min(0).max(5),
  summary: z.string(),
  vulnerabilities: z.object({
    critical: z.array(z.string()),
    high: z.array(z.string()),
    medium: z.array(z.string()),
    low: z.array(z.string())
  }),
  recommendations: z.array(z.string()),
  gasOptimizations: z.array(z.string())
});

// Interface definitions
interface AuditResult {
  stars: number;
  summary: string;
  vulnerabilities: {
    critical: string[];
    high: string[];
    medium: string[];
    low: string[];
  };
  recommendations: string[];
  gasOptimizations: string[];
}

interface SeverityConfig {
  color: string;
  label: string;
}

interface TransactionState {
  isProcessing: boolean;
  hash: string | null;
  error: string | null;
}

// Constants
const COOLDOWN_TIME = 30;
const SEVERITY_CONFIGS: Record<string, SeverityConfig> = {
  critical: { color: 'text-red-500', label: 'Critical' },
  high: { color: 'text-orange-500', label: 'High Risk' },
  medium: { color: 'text-yellow-500', label: 'Medium Risk' },
  low: { color: 'text-blue-500', label: 'Low Risk' }
};

export default function AuditPage() {
  // State management
  const [code, setCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isReviewBlurred, setIsReviewBlurred] = useState(true);
  const [currentChain, setCurrentChain] = useState<keyof typeof CHAIN_CONFIG>('creatorChainTestnet');
  const [txState, setTxState] = useState<TransactionState>({
    isProcessing: false,
    hash: null,
    error: null
  });

  // Mouse tracking effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  // Validation functions
  const isSolidityCode = (code: string): boolean => {
    const hasPragma = /pragma\s+solidity\s+[\^]?\d+\.\d+\.\d+/.test(code);
    const hasContract = /contract\s+\w+/.test(code);
    return hasPragma && hasContract;
  };

  // Chain registration function
  const registerAuditOnChain = async () => {
    if (!result || !code) return;

    setTxState({ isProcessing: true, hash: null, error: null });

    try {
      const { provider, signer } = await connectWallet();
      
      // Calculate contract hash
      const contractHash = ethers.keccak256(
        ethers.toUtf8Bytes(code)
      );

      // Get current chain ID
      const network = await provider.getNetwork();
      const chainId = '0x' + network.chainId.toString(16);
      
      // Check if we're on Creator Network
      if (chainId.toLowerCase() !== CHAIN_CONFIG.creatorChainTestnet.chainId.toLowerCase()) {
        throw new Error('Please switch to Creator Network Testnet to register audits');
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.creatorChainTestnet,
        AUDIT_REGISTRY_ABI,
        signer
      );

      const tx = await contract.registerAudit(
        contractHash,
        result.stars,
        result.summary
      );

      const receipt = await tx.wait();
      setTxState({
        isProcessing: false,
        hash: receipt.transactionHash,
        error: null
      });
      setIsReviewBlurred(false);
    } catch (error) {
      console.error('Failed to register audit:', error);
      setTxState({
        isProcessing: false,
        hash: null,
        error: (error instanceof Error) ? error.message : 'Failed to register audit'
      });
    }
  };

  // Main analysis function
  const analyzeContract = async () => {
    if (!code.trim()) {
      setError('Please enter your smart contract code.');
      return;
    }

    if (!isSolidityCode(code)) {
      setError('Invalid input. Please ensure your code is a valid Solidity smart contract.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setIsReviewBlurred(true);

    try {
      const response = await mistralClient.chat.complete({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: `You are a professional smart contract security auditor. Analyze the provided Solidity smart contract with zero tolerance for security issues.
            
            Rating System (Extremely Strict):
            - 5 stars: ONLY if contract has zero vulnerabilities and follows all best practices
            - 4 stars: ONLY if no critical/high vulnerabilities, max 1-2 medium issues
            - 3 stars: No critical but has high severity issues needing attention
            - 2 stars: Has critical vulnerability or multiple high severity issues
            - 1 star: Multiple critical and high severity vulnerabilities
            - 0 stars: Fundamental security flaws making contract unsafe
            
            Critical Issues (Any reduces rating to 2 or lower):
            - Reentrancy vulnerabilities
            - Unchecked external calls
            - Integer overflow/underflow risks
            - Access control flaws
            - Unprotected selfdestruct
            - Missing input validation

            Return response in the following JSON format:
            {
              "stars": number,
              "summary": "string",
              "vulnerabilities": {
                "critical": ["string"],
                "high": ["string"],
                "medium": ["string"],
                "low": ["string"]
              },
              "recommendations": ["string"],
              "gasOptimizations": ["string"]
            }`
          },
          {
            role: "user",
            content: code
          }
        ],
        responseFormat: { type: "json_object" },
        temperature: 0.1,
        maxTokens: 2048
      });

      const responseText = response.choices?.[0]?.message?.content;
      if (typeof responseText !== 'string') {
        throw new Error('Invalid response format');
      }
      const parsedResponse = JSON.parse(responseText);
      
      // Validate response against schema
      const validatedResponse = VulnerabilitySchema.parse(parsedResponse);

      // Enforce strict rating based on vulnerabilities
      if (validatedResponse.vulnerabilities.critical.length > 0) {
        validatedResponse.stars = Math.min(validatedResponse.stars, 2);
      }
      if (validatedResponse.vulnerabilities.high.length > 0) {
        validatedResponse.stars = Math.min(validatedResponse.stars, 3);
      }
      if (validatedResponse.vulnerabilities.critical.length > 2) {
        validatedResponse.stars = 0;
      }

      setResult(validatedResponse);
      setShowResult(true);
      setCooldown(COOLDOWN_TIME);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError('Analysis failed. Please try again in a few moments.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-emerald-400 mb-4">Smart Contract Audit</h1>
          <p className="text-gray-400">Get instant AI-powered security analysis for your smart contracts on Creator Network</p>
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
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Code Input Panel */}
          <div className="h-[700px] flex flex-col">
            <div 
              className="relative flex-1 bg-gray-900/50 rounded-lg border border-gray-800 hover-gradient-effect"
              style={{
                '--mouse-x': `${mousePosition.x}px`,
                '--mouse-y': `${mousePosition.y}px`
              } as React.CSSProperties}
            >
              <div className="absolute inset-0">
                <div className="p-4 border-b border-gray-800 flex items-center gap-2">
                  <FileCode className="text-emerald-400" size={20} />
                  <span className="font-mono">Solidity Code</span>
                </div>
                <div className="h-[calc(100%-60px)] custom-scrollbar">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// Paste your Solidity code here..."
                    className="w-full h-full p-4 bg-transparent font-mono text-sm focus:outline-none resize-none code-editor"
                    spellCheck="false"
                    disabled={isAnalyzing}
                  />
                </div>
              </div>

              {/* Cooldown Overlay */}
              <AnimatePresence>
                {cooldown > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center"
                  >
                    <Lock className="text-emerald-400 mb-4" size={32} weight="bold" />
                    <div className="text-2xl font-mono mb-2">Cooldown</div>
                    <div className="flex items-center gap-2">
                      <Timer className="text-emerald-400" size={20} />
                      <span className="text-xl">{cooldown}s</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={analyzeContract}
              disabled={isAnalyzing || !code || cooldown > 0}
              className={`mt-4 w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                isAnalyzing || !code || cooldown > 0
                  ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-black hover-gradient-effect'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <CircleNotch className="animate-spin" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Robot size={20} />
                  Analyze Contract
                </>
              )}
            </button>
          </div>

          {/* Results Panel */}
          <div className="h-[700px]">
            {result && showResult ? (
              <div 
                className="h-full bg-gray-900/50 rounded-lg border border-gray-800 hover-gradient-effect relative"
                style={{
                  '--mouse-x': `${mousePosition.x}px`,
                  '--mouse-y': `${mousePosition.y}px`
                } as React.CSSProperties}
              >
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                  <span className="font-mono">Analysis Results</span>
                  {txState.hash && (
                    <a 
                      href={`${CHAIN_CONFIG[currentChain].blockExplorerUrls[0]}/tx/${txState.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1"
                    >
                      View Transaction <ArrowSquareOut size={16} />
                    </a>
                  )}
                </div>

                <div className={`h-[calc(100%-60px)] custom-scrollbar overflow-auto p-6 transition-all duration-300 ${isReviewBlurred ? 'blur-md select-none' : ''}`}>
                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          weight={i < result.stars ? "fill" : "regular"}
                          className={i < result.stars ? "text-emerald-400" : "text-gray-600"}
                          size={24}
                        />
                      ))}
                    </div>
                    <span className="text-gray-400">Security Score</span>
                  </div>

                  {/* Summary */}
                  <div className="mb-6">
                    <h3 className="font-mono text-sm text-gray-400 mb-2">SUMMARY</h3>
                    <p className="text-white">{result.summary}</p>
                  </div>

                  {/* Vulnerabilities */}
                  <div className="mb-6 space-y-4">
                    <h3 className="font-mono text-sm text-gray-400 mb-2">VULNERABILITIES</h3>
                    {Object.entries(result.vulnerabilities).map(([severity, issues]) => {
                      if (issues.length === 0) return null;
                      const config = SEVERITY_CONFIGS[severity];
                      return (
                        <div key={severity} className="bg-gray-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Warning className={config.color} size={20} />
                            <span className="font-semibold">{config.label}</span>
                          </div>
                          <ul className="space-y-2">
                            {issues.map((issue, index) => (
                              <li key={index} className="text-gray-400 text-sm">
                                • {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recommendations */}
                  <div className="mb-6">
                    <h3 className="font-mono text-sm text-gray-400 mb-2">RECOMMENDATIONS</h3>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="text-emerald-400 mt-1 flex-shrink-0" size={16} />
                          <span className="text-gray-300">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Gas Optimizations */}
                  <div className="mb-6">
                    <h3 className="font-mono text-sm text-gray-400 mb-2">GAS OPTIMIZATIONS</h3>
                    <ul className="space-y-2">
                      {result.gasOptimizations.map((opt, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Cube className="text-emerald-400 mt-1 flex-shrink-0" size={16} />
                          <span className="text-gray-300">{opt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Register Audit Button Overlay */}
                {isReviewBlurred && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={registerAuditOnChain}
                      disabled={txState.isProcessing}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      {txState.isProcessing ? (
                        <>
                          <CircleNotch className="animate-spin" size={20} />
                          Registering Audit...
                        </>
                      ) : (
                        <>
                          <Lock size={20} />
                          Register Audit On-Chain
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Transaction Error Message */}
                {txState.error && (
                  <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg">
                    {txState.error}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full bg-gray-900/50 rounded-lg border border-gray-800 flex items-center justify-center text-gray-400">
                Run analysis to see results
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}