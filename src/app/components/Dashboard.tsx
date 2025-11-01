'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, RefreshCw, PlusCircle } from 'lucide-react';
import { getPollContract, config } from '../utils/contract';
import PollCard from './PollCard';
import ActivityFeed from './ActivityFeed';
import NetworkInfo from './NetworkInfo';
import BlockchainBanner from './BlockchainBanner';

interface Poll {
    id: number;
    question: string;
    options: string[];
    votes: number[];
    creator: string;
    isActive: boolean;
    totalVotes: number;
}

interface DashboardProps {
    onStatsUpdate?: (stats: { totalPolls: number; totalVotes: number; activeVoters: number }) => void;
    onCreatePoll?: () => void;
}

export default function Dashboard({ onStatsUpdate, onCreatePoll }: DashboardProps = {}) {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({ totalPolls: 0, totalVotes: 0, activeVoters: 0 });

    const loadPolls = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Check if contract is configured
            if (!config.contractId) {
                setError('Contract not configured. Please set NEXT_PUBLIC_CONTRACT_ID in .env.local');
                setIsLoading(false);
                return;
            }

            try {
                const contract = getPollContract();
                
                // Get poll count
                const pollCountResult = await contract.get_poll_count({ simulate: true });
                const pollCount = pollCountResult.result || 0;
                
                if (pollCount === 0) {
                    setPolls([]);
                    setStats({ totalPolls: 0, totalVotes: 0, activeVoters: 0 });
                    setIsLoading(false);
                    return;
                }

                // Get all poll IDs
                const pollIdsResult = await contract.get_all_poll_ids({ simulate: true });
                const pollIds = pollIdsResult.result || [];
                
                const loadedPolls: Poll[] = [];
                let totalVotes = 0;
                const uniqueVoters = new Set<string>();
                
                for (const pollId of pollIds) {
                    try {
                        // Get poll details
                        const pollResult = await contract.get_poll({ poll_id: pollId }, { simulate: true });
                        const pollData = pollResult.result;
                        
                        if (!pollData) continue;

                        // Get results
                        const resultsResult = await contract.get_results({ poll_id: pollId }, { simulate: true });
                        const votes = resultsResult.result || [];
                        
                        const pollVotes = votes.reduce((sum: number, v: number) => sum + v, 0);
                        totalVotes += pollVotes;
                        
                        loadedPolls.push({
                            id: pollData.id,
                            question: pollData.question.toString(),
                            options: pollData.options.map((opt: any) => opt.toString()),
                            votes: votes,
                            creator: pollData.creator,
                            isActive: pollData.is_active,
                            totalVotes: pollVotes,
                        });
                    } catch (err: any) {
                        console.error(`Failed to load poll ${pollId}:`, err);
                    }
                }
                
                setPolls(loadedPolls);
                const newStats = { 
                    totalPolls: loadedPolls.length, 
                    totalVotes, 
                    activeVoters: uniqueVoters.size 
                };
                setStats(newStats);
                if (onStatsUpdate) {
                    onStatsUpdate(newStats);
                }
            } catch (contractError: any) {
                console.error('Contract error:', contractError);
                setError(`Failed to load polls: ${contractError.message}`);
                setPolls([]);
            }

        } catch (err: any) {
            console.error('Error loading polls:', err);
            setError(err.message || 'Failed to load polls');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPolls();
    }, []);

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

    const chartData = polls.map(poll => ({
        name: poll.question.length > 25 ? poll.question.slice(0, 25) + '...' : poll.question,
        votes: poll.totalVotes,
    }));

    const pieData = polls[0]?.options.map((option, index) => ({
        name: option,
        value: polls[0].votes[index] || 0,
    })) || [];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-semibold mb-1">{payload[0].payload.name}</p>
                    <p className="text-blue-400 font-bold">
                        {payload[0].value} votes
                    </p>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                <p className="text-red-400 font-medium mb-4">{error}</p>
                <button
                    onClick={loadPolls}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Blockchain Banner */}
            <BlockchainBanner />

            {/* Action Buttons */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">
                    Poll Dashboard
                    <span className="text-lg text-gray-400 font-normal ml-3">
                        Decentralized Voting Platform
                    </span>
                </h1>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadPolls}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-xl transition-all border border-gray-700/50 disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                            <span className="text-sm font-medium">Refresh</span>
                        </button>
                        {onCreatePoll && (
                            <button
                                onClick={onCreatePoll}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 font-semibold"
                            >
                                <PlusCircle size={18} />
                                <span>Create Poll</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    {/* Charts Row */}
                    {polls.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                <BarChart3 className="text-white" size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Polls Overview</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#9ca3af" 
                                    fontSize={12}
                                    tick={{ fill: '#9ca3af' }}
                                />
                                <YAxis 
                                    stroke="#9ca3af" 
                                    fontSize={12}
                                    tick={{ fill: '#9ca3af' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar 
                                    dataKey="votes" 
                                    radius={[12, 12, 0, 0]}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <BarChart3 className="text-white" size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Current Poll Distribution</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={90}
                                    innerRadius={50}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                    )}
                </div>
                <div>
                    <NetworkInfo />
                </div>
            </div>

            {/* Polls and Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Polls List */}
                <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                    <BarChart3 className="text-white" size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-white">All Polls</h3>
                            </div>
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
                                {polls.length} {polls.length === 1 ? 'Poll' : 'Polls'}
                            </span>
                        </div>
                        
                        {polls.length === 0 ? (
                            <div className="text-center py-12">
                                <BarChart3 className="mx-auto text-gray-600 mb-3" size={48} />
                                <p className="text-gray-400 mb-1 font-medium">No polls yet</p>
                                <p className="text-gray-500 text-sm">Create your first poll to get started!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {polls.map((poll) => (
                                    <PollCard 
                                        key={poll.id} 
                                        poll={poll}
                                        onVoteSuccess={() => {
                                            // Reload polls after vote
                                            setTimeout(() => loadPolls(), 2000);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity Feed */}
                <div>
                    <ActivityFeed />
                </div>
            </div>
        </div>
    );
}
