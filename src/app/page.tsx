'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  Shield,
  ArrowRight,
  Star,
  Code,
  Lightning,
  TwitterLogo,
  GithubLogo,
  DiscordLogo,
  TelegramLogo,
  FileSearch,
  Robot,
  Cube,
  FileText,
  TestTube,
} from 'phosphor-react';
import Image from 'next/image';
import Link from 'next/link';

// Simplified chain config to only include Linea Network
const CHAIN_CONFIG = {
  lineaSepolia: {
    chainId: '0xe705', // 59141 in hex
    chainName: 'Linea Sepolia',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://rpc.sepolia.linea.build'],
    blockExplorerUrls: ['https://sepolia.lineascan.build'],
    iconPath: '/chains/linea.png'
  }
};

interface Audit {
  contractHash: string;
  stars: number;
  summary: string;
  auditor: string;
  timestamp: number;
  chain: string;
}

const features = [
  {
    icon: Shield,
    title: 'AI-Powered Analysis',
    description: 'Advanced smart contract analysis powered by Finetuned AI'
  },
  {
    icon: Lightning,
    title: 'Multi-Chain Support',
    description: 'Audit smart contracts on Linea network'
  },
  {
    icon: Code,
    title: 'On-Chain Verification',
    description: 'All audit reports are stored permanently on the blockchain'
  },
  {
    icon: FileText,
    title: 'Documentation Generation',
    description: 'Gemini powered documentation for Solidity contracts'
  },
  {
    icon: TestTube,
    title: 'Test Suite Generation',
    description: 'Multi-framework test case generation'
  },
];

const recentAudits: Audit[] = [
  {
    contractHash: '0x123...abc',
    stars: 5,
    summary: 'No critical vulnerabilities found. Code follows best practices.',
    auditor: '0xABc...123',
    timestamp: 1703116800,
    chain: 'lineaSepolia'
  },
  {
    contractHash: '0x456...def',
    stars: 4,
    summary: 'Minor optimizations suggested. Overall secure implementation.',
    auditor: '0xDEf...456',
    timestamp: 1703030400,
    chain: 'lineaSepolia'
  },
  {
    contractHash: '0x789...ghi',
    stars: 5,
    summary: 'Excellent implementation with robust security measures.',
    auditor: '0xGHi...789',
    timestamp: 1702944000,
    chain: 'lineaSepolia'
  }
];

const steps = [
  {
    icon: FileSearch,
    title: 'Submit Contract',
    description: 'Paste your Solidity smart contract code into our platform'
  },
  {
    icon: Robot,
    title: 'AI Analysis',
    description: 'Our Fintuned AI analyzes your code for vulnerabilities'
  },
  {
    icon: FileText,
    title: 'Generate Docs',
    description: 'Generate comprehensive contract documentation with a single click'
  },
  {
    icon: TestTube,
    title: 'Test Suite',
    description: 'Generate test suite with best practices for popular frameworks'
  },
  {
    icon: Cube,
    title: 'On-Chain Report',
    description: 'Audit report is permanently stored on the blockchain'
  },
  {
    icon: Shield,
    title: 'Verification',
    description: 'Get your smart contract verified and secure'
  }
];

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    });

    const handleMouseMove = (e: MouseEvent) => {
      const elements = document.getElementsByClassName('hover-gradient-effect');
      Array.from(elements).forEach((element) => {
        const htmlElement = element as HTMLElement;
        const rect = htmlElement.getBoundingClientRect();
        htmlElement.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        htmlElement.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 via-[#0A0B0D] to-gray-900/10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-mono font-bold mb-6">
                NEXT-GEN<br /> SMART CONTRACT<br />
                <span className="text-white">SECURITY</span>
              </h1>
              <p className="text-gray-400 text-lg mb-8 max-w-xl">
                Secure your smart contracts with AI-powered analysis, documentation, and on-chain verification. Get instant security audits powered by Finetuned AI, now optimized for Linea Network.
              </p>
              <div className="flex gap-4">
                <Link href="/audit">
                  <button className="hover-gradient-effect px-6 py-3 bg-dark-100 hover:bg-dark-200 text-white font-bold rounded-lg transition-all duration-200 flex items-center gap-2">
                    Start Audit <ArrowRight weight="bold" />
                  </button>
                </Link>
                <Link href="/reports">
                  <button className="hover-gradient-effect px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-200">
                    View Reports
                  </button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative z-10 bg-dark-50/40 backdrop-blur-sm rounded-lg border border-dark-200 p-8 shadow-lg">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/30 to-gray-500/30 rounded-lg opacity-20 blur-sm"></div>
                <div className="relative rounded-lg overflow-hidden">
                  <pre className="language-solidity p-4 text-sm bg-dark-100 rounded-lg code-editor">
                    <code>
                      <div>// SPDX-License-Identifier: MIT</div>
                      <div>pragma solidity ^0.8.17;</div>
                      <div></div>
                      <div><span className="text-white">contract</span> <span className="text-gray-300">AuditFi</span> {'{'}</div>
                      <div>    <span className="text-white">address</span> <span className="text-gray-300">private</span> owner;</div>
                      <div>    <span className="text-white">mapping</span>(<span className="text-white">address</span> =&gt; <span className="text-white">bool</span>) <span className="text-gray-300">private</span> auditors;</div>
                      <div></div>
                      <div>    <span className="text-gray-300">constructor</span>() {'{'}</div>
                      <div>        owner = <span className="text-gray-300">msg.sender</span>;</div>
                      <div>        auditors[<span className="text-gray-300">msg.sender</span>] = <span className="text-white">true</span>;</div>
                      <div>    {'}'}</div>
                      <div></div>
                      <div>    <span className="text-white">function</span> <span className="text-gray-300">auditContract</span>(<span className="text-white">string</span> <span className="text-gray-300">memory</span> _contractHash) <span className="text-gray-300">external</span> {'{'}</div>
                      <div>        <span className="text-white">require</span>(auditors[<span className="text-gray-300">msg.sender</span>], <span className="text-string">"Not an auditor"</span>);</div>
                      <div>        <span className="text-comment">// Audit logic here</span></div>
                      <div>    {'}'}</div>
                      <div>{'}'}</div>
                    </code>
                  </pre>

                  <div className="mt-4 p-4 bg-dark-100/70 backdrop-blur-md rounded-lg border border-dark-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="text-green-400" weight="fill" size={24} />
                      <h3 className="text-lg font-bold text-green-400">No Vulnerabilities Found</h3>
                    </div>
                    <div className="text-sm text-gray-400">
                      This smart contract has been verified by AuditFi and follows industry best practices.
                      <div className="mt-2 flex items-center gap-1 text-white">
                        <span>View full report</span>
                        <ArrowRight weight="bold" className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Linea & MetaMask Integration Section */}
      <section className="relative py-24 bg-dark-50/30 border-y border-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-aos="fade-up">
              Powered by <span className="text-white">Linea</span> & <span className="text-white">MetaMask</span>
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              AuditFi leverages the security and speed of Linea, Ethereum's premier zkEVM Layer 2 scaling solution, combined with MetaMask's industry-leading wallet technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div data-aos="fade-right">
              <div className="bg-dark-50 p-6 rounded-xl border border-dark-200 hover-gradient-effect">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black mr-4">
                    <Image 
                      src="/chains/linea.png" 
                      alt="Linea Logo" 
                      width={32} 
                      height={32} 
                      className="rounded-full"
                    />
                  </div>
                  <h3 className="text-xl font-bold">Linea Network</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Built on Linea, the home network for the world. Experience lightning-fast transactions, low gas fees, and the security of Ethereum's zero-knowledge proofs.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-gray-300">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white mr-2">✓</span>
                    Ethereum L2 zkEVM technology
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white mr-2">✓</span>
                    Low transaction costs
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white mr-2">✓</span>
                    Fast finality and Ethereum security
                  </li>
                </ul>
                <a href="https://linea.build" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-white hover:text-gray-300 transition-colors">
                  Learn more about Linea 
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </div>
            </div>

            <div data-aos="fade-left">
              <div className="bg-dark-50 p-6 rounded-xl border border-dark-200 hover-gradient-effect">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black mr-4">
                    <Image 
                      src="/chains/metamask.svg" 
                      alt="MetaMask Logo" 
                      width={32} 
                      height={32} 
                    />
                  </div>
                  <h3 className="text-xl font-bold">MetaMask SDK</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  AuditFi integrates with MetaMask SDK to provide a seamless wallet connection experience, allowing you to easily interact with the Linea network.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-gray-300">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white mr-2">✓</span>
                    Seamless wallet connection
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white mr-2">✓</span>
                    Cross-platform compatibility
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white mr-2">✓</span>
                    Secure transaction signing
                  </li>
                </ul>
                <a href="https://docs.metamask.io/sdk/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-white hover:text-gray-300 transition-colors">
                  Explore MetaMask SDK 
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-aos="fade-up">Key Features</h2>
            <p className="text-gray-400 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              Our platform offers a comprehensive suite of tools for smart contract security and documentation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8" data-aos="fade-up" data-aos-delay="200">
            {features.map((feature, index) => (
              <div key={index} className="bg-dark-50/40 backdrop-blur-sm p-6 rounded-lg border border-dark-200 hover-gradient-effect transition-all duration-300 hover:scale-105">
                <div className="h-12 w-12 bg-dark-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon size={24} className="text-white" weight="bold" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-dark-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-aos="fade-up">How It Works</h2>
            <p className="text-gray-400 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              Get your smart contract audited in a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-aos="fade-up" data-aos-delay="200">
            {steps.map((step, index) => (
              <div key={index} className="bg-dark-50/40 backdrop-blur-sm p-6 rounded-lg border border-dark-200 transition-all duration-300 hover-gradient-effect">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 bg-dark-100 rounded-lg flex items-center justify-center mr-3">
                    <step.icon size={20} className="text-white" weight="bold" />
                  </div>
                  <span className="text-gray-500 text-xl font-mono">Step {index + 1}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Linea Chain Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-dark-100 px-4 py-2 rounded-full text-sm text-gray-400 font-medium mb-4">
              BUILT FOR ETHEREUM L2
            </div>
            <h2 className="text-4xl font-bold font-mono mb-4">
              <span className="text-white">Linea</span> Network Integration
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Optimized for the Linea Network ecosystem with native support for ETH tokens
            </p>
          </motion.div>

          <div className="bg-dark-50/40 backdrop-blur-sm rounded-lg border border-dark-200 p-8 max-w-3xl mx-auto hover-gradient-effect">
            <div className="flex items-center">
              <div className="mr-6 relative">
                <div className="absolute inset-0 bg-white/20 rounded-full filter blur-md"></div>
                <Image 
                  src="/chains/linea.png"
                  alt="Linea Network"
                  width={60}
                  height={60}
                  className="relative z-10 rounded-full"
                />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">Linea Network Sepolia Testnet</h3>
                <p className="text-gray-400">Native Token: <span className="text-white font-semibold">ETH</span></p>
                <div className="flex items-center mt-3 space-x-4">
                  <a href="https://sepolia.lineascan.build" target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:text-gray-300 flex items-center space-x-1">
                    <FileSearch size={16} />
                    <span>Block Explorer</span>
                  </a>
                  <a href="https://docs.linea.build" target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:text-gray-300 flex items-center space-x-1">
                    <Code size={16} />
                    <span>Documentation</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-dark-50/30 border-t border-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" data-aos="fade-up">
            Ready to Secure Your Smart Contracts?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8" data-aos="fade-up" data-aos-delay="100">
            Start auditing your smart contracts today with our AI-powered platform
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4" data-aos="fade-up" data-aos-delay="200">
            <Link href="/audit">
              <button className="px-8 py-3 bg-dark-100 hover:bg-dark-200 text-white font-bold rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto sm:mx-0">
                Start Free Audit
                <ArrowRight weight="bold" />
              </button>
            </Link>
            <Link href="/docs">
              <button className="px-8 py-3 bg-dark-200/50 hover:bg-dark-200 text-white rounded-lg transition-all duration-200 mx-auto sm:mx-0">
                View Documentation
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-aos="fade-up">Resources</h2>
            <p className="text-gray-400 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              Explore our guides and documentation to get the most out of AuditFi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8" data-aos="fade-up" data-aos-delay="200">
            <div className="bg-dark-50/40 backdrop-blur-sm p-6 rounded-lg border border-dark-200 hover-gradient-effect">
              <h3 className="text-xl font-bold mb-4">Developer Documentation</h3>
              <p className="text-gray-400 mb-4">Comprehensive guides and API documentation for integrating AuditFi into your development workflow</p>
              <ul className="space-y-2">
                <li>
                  <a href="https://docs.linea.build/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    API References
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Tutorials
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-dark-50/40 backdrop-blur-sm p-6 rounded-lg border border-dark-200 hover-gradient-effect">
              <h3 className="text-xl font-bold mb-4">Smart Contract Security</h3>
              <p className="text-gray-400 mb-4">Learn about common vulnerabilities and best practices for writing secure smart contracts</p>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Security Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Common Vulnerabilities
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Best Practices
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-dark-50/40 backdrop-blur-sm p-6 rounded-lg border border-dark-200 hover-gradient-effect">
              <h3 className="text-xl font-bold mb-4">Community</h3>
              <p className="text-gray-400 mb-4">Join our growing community of developers and security researchers</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <TwitterLogo size={24} weight="fill" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <GithubLogo size={24} weight="fill" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <DiscordLogo size={24} weight="fill" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <TelegramLogo size={24} weight="fill" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}