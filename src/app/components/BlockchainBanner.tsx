'use client';

import React from 'react';
import { Link, Shield, Zap } from 'lucide-react';

export default function BlockchainBanner() {
    return (
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="text-white" size={20} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-semibold text-sm">🔗 Powered by Stellar Blockchain</h4>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded border border-emerald-500/30 flex items-center gap-1">
                            <Zap size={10} />
                            Live
                        </span>
                    </div>
                    <p className="text-xs text-gray-400">
                        All polls and votes are stored on-chain. Every transaction is executed on Stellar Testnet. 
                        No local data - everything is decentralized and transparent.
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                        <div className="flex items-center gap-1 text-emerald-400">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span>Blockchain Connected</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-400">
                            <Link size={12} />
                            <span>Testnet Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



