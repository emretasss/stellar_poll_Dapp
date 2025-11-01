'use client';

import React from 'react';
import { Network, Link2, Server, CheckCircle } from 'lucide-react';
import { config } from '../utils/contract';

export default function NetworkInfo() {
    return (
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Network className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">Network Status</h3>
            </div>
            
            <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Server size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-300">RPC Server</span>
                        </div>
                        <CheckCircle size={16} className="text-emerald-400" />
                    </div>
                    <p className="text-xs text-gray-400 font-mono truncate">
                        {config.rpcUrl || 'Not configured'}
                    </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Network size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-300">Network</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded border border-emerald-500/30">
                            Testnet
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono truncate">
                        {config.networkPassphrase.split(';')[0].trim()}...
                    </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Link2 size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-300">Contract ID</span>
                        </div>
                        {config.contractId ? (
                            <CheckCircle size={16} className="text-emerald-400" />
                        ) : (
                            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 font-mono break-all">
                        {config.contractId || 'Not deployed'}
                    </p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700/50">
                <p className="text-xs text-gray-500 text-center">
                    All transactions are executed on Stellar Testnet blockchain
                </p>
            </div>
        </div>
    );
}



