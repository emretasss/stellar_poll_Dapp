'use client';

import React, { useState, useEffect } from 'react';
import { Vote, CheckCircle, Clock, User, ExternalLink, Loader2 } from 'lucide-react';
import { getPollContract, config } from '../utils/contract';
import { StellarWalletsKit, WalletNetwork, allowAllModules } from '@creit.tech/stellar-wallets-kit';

// Get kit instance
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

interface PollCardProps {
    poll: {
        id: number;
        question: string;
        options: string[];
        votes: number[];
        creator: string;
        isActive: boolean;
        totalVotes: number;
    };
    onVoteSuccess?: () => void;
}

export default function PollCard({ poll, onVoteSuccess }: PollCardProps) {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isVoting, setIsVoting] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState<boolean | null>(null);
    const [voteError, setVoteError] = useState<string | null>(null);
    const [kit, setKit] = useState<StellarWalletsKit | null>(null);

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

    const checkHasVoted = async (voterAddress: string) => {
        if (!config.contractId) return;
        try {
            const contract = getPollContract();
            const result = await contract.has_voted({
                poll_id: poll.id,
                voter: voterAddress,
            }, { simulate: true });
            
            if (result.result !== undefined) {
                setHasVoted(result.result);
            }
        } catch (error) {
            console.error('Error checking vote status:', error);
        }
    };

    useEffect(() => {
        if (!kit) return;
        
        const checkWallet = async () => {
            try {
                const currentAddress = await kit.getAddress();
                if (currentAddress?.address) {
                    setAddress(currentAddress.address);
                    // Check if user has voted
                    checkHasVoted(currentAddress.address);
                }
            } catch (error) {
                // Not connected
            }
        };
        checkWallet();
    }, [kit]);

    const handleVote = async (optionIndex: number) => {
        if (!address) {
            setVoteError('Please connect your wallet to vote');
            setTimeout(() => setVoteError(null), 3000);
            return;
        }

        if (hasVoted) {
            setVoteError('You have already voted on this poll');
            setTimeout(() => setVoteError(null), 3000);
            return;
        }

        if (!poll.isActive) {
            setVoteError('This poll is closed');
            setTimeout(() => setVoteError(null), 3000);
            return;
        }

        setIsVoting(true);
        setVoteError(null);

        try {
            if (!config.contractId) {
                throw new Error('Contract not configured');
            }

            if (!kit) {
                throw new Error('Wallet kit not initialized. Please wait a moment and try again.');
            }

            const contract = getPollContract();
            
            // Create vote transaction
            const tx = await contract.vote({
                voter: address,
                poll_id: poll.id,
                option_index: optionIndex,
            }, { simulate: false });

            // Sign and send
            const result = await tx.signAndSend({
                signTransaction: async (xdr: string) => {
                    const signed = await kit.signTransaction(xdr);
                    return signed.signedTxXdr;
                },
            });

            // Transaction was sent successfully (if we reach here, it was successful)
            setHasVoted(true);
            setSelectedOption(optionIndex);
            if (onVoteSuccess) {
                onVoteSuccess();
            }
        } catch (error: any) {
            console.error('Error voting:', error);
            setVoteError(error.message || 'Failed to vote. Please try again.');
        } finally {
            setIsVoting(false);
        }
    };

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#06b6d4', '#a855f7'];

    return (
        <div className="group bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl p-6 border border-gray-600/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h4 className="text-white font-semibold text-lg mb-2">{poll.question}</h4>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>Poll #{poll.id}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <User size={12} />
                            <span className="font-mono">{poll.creator.slice(0, 8)}...{poll.creator.slice(-6)}</span>
                        </div>
                        {hasVoted && (
                            <div className="flex items-center gap-1 text-emerald-400">
                                <CheckCircle size={12} />
                                <span>Voted</span>
                            </div>
                        )}
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    poll.isActive 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/40'
                }`}>
                    {poll.isActive ? 'Active' : 'Closed'}
                </span>
            </div>

            {/* Vote Error */}
            {voteError && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{voteError}</p>
                </div>
            )}

            {/* Options */}
            <div className="space-y-3 mb-4">
                {poll.options.map((option, idx) => {
                    const votes = poll.votes[idx] || 0;
                    const percentage = poll.totalVotes > 0 
                        ? Math.round((votes / poll.totalVotes) * 100) 
                        : 0;
                    const isSelected = selectedOption === idx || (hasVoted && idx === selectedOption);
                    
                    return (
                        <div 
                            key={idx} 
                            className={`bg-gray-800/50 rounded-lg p-4 border transition-all ${
                                isSelected 
                                    ? 'border-emerald-500/50 bg-emerald-500/10' 
                                    : 'border-gray-700/50 hover:border-gray-600/50'
                            } ${!hasVoted && poll.isActive && address ? 'cursor-pointer hover:bg-gray-800/70' : ''}`}
                            onClick={() => !hasVoted && poll.isActive && address && !isVoting && handleVote(idx)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="text-sm font-medium text-gray-300">{option}</span>
                                    {isSelected && (
                                        <CheckCircle size={16} className="text-emerald-400" />
                                    )}
                                </div>
                                <span className="text-xs font-bold text-white bg-gray-700/50 px-2 py-1 rounded">
                                    {percentage}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden mb-1">
                                <div
                                    className="h-2 rounded-full transition-all duration-500"
                                    style={{ 
                                        width: `${percentage}%`,
                                        background: `linear-gradient(to right, ${COLORS[idx % COLORS.length]}, ${COLORS[(idx + 1) % COLORS.length]})`
                                    }}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-400 font-medium">{votes.toLocaleString()} votes</p>
                                {!hasVoted && poll.isActive && address && !isVoting && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleVote(idx);
                                        }}
                                        className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs rounded transition"
                                    >
                                        <Vote size={12} />
                                        <span>Vote</span>
                                    </button>
                                )}
                                {isVoting && selectedOption === idx && (
                                    <Loader2 size={12} className="text-blue-400 animate-spin" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                <p className="text-sm text-gray-400 font-medium">
                    {poll.totalVotes.toLocaleString()} total votes
                </p>
                {!address && (
                    <p className="text-xs text-yellow-400">Connect wallet to vote</p>
                )}
                {address && hasVoted && (
                    <p className="text-xs text-emerald-400">✓ Your vote recorded on blockchain</p>
                )}
            </div>
        </div>
    );
}


