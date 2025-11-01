'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    StellarWalletsKit, 
    WalletNetwork, 
    allowAllModules,
    ISupportedWallet 
} from '@creit.tech/stellar-wallets-kit';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';

// Global kit instance
let kitInstance: StellarWalletsKit | null = null;

function getKit(): StellarWalletsKit {
    // Only initialize on client side
    if (typeof window === 'undefined') {
        throw new Error('StellarWalletsKit can only be initialized on the client side');
    }
    if (!kitInstance) {
        kitInstance = new StellarWalletsKit({
            network: WalletNetwork.TESTNET,
            modules: allowAllModules(),
        });
    }
    return kitInstance;
}

export default function WalletConnect() {
    const [copied, setCopied] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [kit, setKit] = useState<StellarWalletsKit | null>(null);
    const hasCheckedRef = useRef(false);

    // Initialize kit only on client side
    useEffect(() => {
        if (typeof window !== 'undefined' && !kit) {
            try {
                setKit(getKit());
            } catch (error) {
                console.error('Failed to initialize StellarWalletsKit:', error);
            }
        }
    }, [kit]);

    useEffect(() => {
        // Check connection only once on mount and only if kit is initialized
        if (hasCheckedRef.current || !kit) return;
        
        const checkConnection = async () => {
            try {
                const currentAddress = await kit.getAddress();
                if (currentAddress?.address) {
                    setAddress(currentAddress.address);
                }
            } catch (error) {
                // Not connected - silent fail
            } finally {
                hasCheckedRef.current = true;
            }
        };

        checkConnection();
    }, [kit]);

    const handleConnect = async () => {
        if (isConnecting || address || !kit) return;
        
        setIsConnecting(true);
        try {
            await kit.openModal({
                onWalletSelected: async (option: ISupportedWallet) => {
                    try {
                        kit.setWallet(option.id);
                        const { address: walletAddress } = await kit.getAddress();
                        if (walletAddress) {
                            setAddress(walletAddress);
                        }
                    } catch (error) {
                        console.error('Wallet connection error:', error);
                        alert('Failed to connect wallet. Please try again.');
                    } finally {
                        setIsConnecting(false);
                    }
                },
            });
        } catch (error) {
            console.error('Failed to open wallet modal:', error);
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await kit.disconnect();
            setAddress(null);
            hasCheckedRef.current = false;
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    };

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (address) {
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

        return (
            <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-sm shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                <Wallet size={20} className="text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-950"></div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-400 mb-1">Connected Wallet</p>
                            <div className="flex items-center gap-2">
                                <p className="font-mono text-sm font-bold text-white">
                                    {shortAddress}
                                </p>
                                <button
                                    onClick={copyAddress}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                                    title="Copy address"
                                >
                                    {copied ? (
                                        <Check size={14} className="text-emerald-400" />
                                    ) : (
                                        <Copy size={14} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleDisconnect}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all duration-200 font-medium text-sm"
                    >
                        <LogOut size={16} />
                        <span>Disconnect</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="group relative flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
        >
            <Wallet size={20} className="group-hover:rotate-12 transition-transform duration-300" />
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-white/0 to-pink-400/0 group-hover:from-blue-400/20 group-hover:via-white/10 group-hover:to-pink-400/20 transition-all duration-300"></div>
        </button>
    );
}
