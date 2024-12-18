'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  Star, 
  ArrowRight, 
  Warning,
  CheckCircle,
  FileCode,
  Robot,
  Cube,
  Lock,
  Timer,
  CircleNotch 
} from 'phosphor-react';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const sanitizeResponse = (response: any): AuditResult => {
    // Ensure all arrays exist and contain only strings
    const ensureStringArray = (arr: any[] | undefined): string[] => {
      if (!Array.isArray(arr)) return [];
      return arr.map(item => String(item)).filter(item => item.length > 0);
    };
  
    // Ensure vulnerabilities object exists with all required properties
    const vulnerabilities = {
      critical: ensureStringArray(response?.vulnerabilities?.critical),
      high: ensureStringArray(response?.vulnerabilities?.high),
      medium: ensureStringArray(response?.vulnerabilities?.medium),
      low: ensureStringArray(response?.vulnerabilities?.low)
    };
  
    // Construct sanitized response
    return {
      stars: Math.min(Math.max(Number(response?.stars) || 0, 0), 5),
      summary: String(response?.summary || 'Analysis completed.'),
      vulnerabilities,
      recommendations: ensureStringArray(response?.recommendations),
      gasOptimizations: ensureStringArray(response?.gasOptimizations)
    };
  };

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

const COOLDOWN_TIME = 30;
const SEVERITY_CONFIGS: Record<string, SeverityConfig> = {
  critical: { color: 'text-red-500', label: 'Critical' },
  high: { color: 'text-orange-500', label: 'High Risk' },
  medium: { color: 'text-yellow-500', label: 'Medium Risk' },
  low: { color: 'text-blue-500', label: 'Low Risk' }
};

export default function AuditPage() {
  const [code, setCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  // Add these validation functions
const isSolidityCode = (code: string): boolean => {
    // Check for basic Solidity indicators
    const hasPragma = /pragma\s+solidity\s+[\^]?\d+\.\d+\.\d+/.test(code);
    const hasContract = /contract\s+\w+/.test(code);
    
    return hasPragma && hasContract;
  };
  
  const analyzeContract = async () => {
    if (!code.trim()) {
      setError('Please enter your smart contract code.');
      return;
    }

    if (!isSolidityCode(code)) {
      setError('Invalid input. Please ensure your code is a valid Solidity smart contract (must include pragma directive and contract declaration).');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      const prompt = `You are a professional smart contract security auditor. Analyze the provided Solidity smart contract for security vulnerabilities.

      Return your analysis in this JSON format:
      {
        "stars": (number 0-5),
        "summary": "Brief overall assessment",
        "vulnerabilities": {
          "critical": ["Detailed explanation of critical issue"],
          "high": ["Detailed explanation of high severity issue"],
          "medium": ["Detailed explanation of medium severity issue"],
          "low": ["Detailed explanation of low severity issue"]
        },
        "recommendations": ["Specific recommendation"],
        "gasOptimizations": ["Specific optimization suggestion"]
      }

      Contract to analyze:
      ${code}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Try to parse the response, handling potential JSON formatting issues
      let parsedResponse;
      try {
        // First, try direct parsing
        parsedResponse = JSON.parse(responseText);
      } catch (parseError) {
        // If direct parsing fails, try to extract JSON from markdown blocks
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                         responseText.match(/```\s*([\s\S]*?)\s*```/) ||
                         responseText.match(/({[\s\S]*})/);
                         
        if (jsonMatch) {
          try {
            parsedResponse = JSON.parse(jsonMatch[1]);
          } catch {
            throw new Error('Failed to parse AI response as JSON');
          }
        } else {
          throw new Error('Could not find valid JSON in AI response');
        }
      }

      // Sanitize and validate the response
      const sanitizedResponse = sanitizeResponse(parsedResponse);
      
      setResult(sanitizedResponse);
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold mb-4">Smart Contract Audit</h1>
          <p className="text-gray-400">Get instant AI-powered security analysis for your smart contracts</p>
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
              } as any}
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
                className="h-full bg-gray-900/50 rounded-lg border border-gray-800 hover-gradient-effect"
                style={{
                  '--mouse-x': `${mousePosition.x}px`,
                  '--mouse-y': `${mousePosition.y}px`
                } as any}
              >
                <div className="p-4 border-b border-gray-800">
                  <span className="font-mono">Analysis Results</span>
                </div>
                <div className="h-[calc(100%-60px)] custom-scrollbar overflow-auto p-6">
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