'use client';

import React, { useState, useEffect } from 'react';
import { Activity, PlusCircle, Vote, CheckCircle, Clock } from 'lucide-react';
import { getPollContract, config } from '../utils/contract';

interface ActivityItem {
    type: 'poll_created' | 'vote_cast';
    pollId: number;
    question: string;
    timestamp: number;
    address: string;
}

export default function ActivityFeed() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadActivities();
        // Refresh every 10 seconds
        const interval = setInterval(loadActivities, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadActivities = async () => {
        if (!config.contractId) {
            setIsLoading(false);
            return;
        }

        try {
            const contract = getPollContract();
            const pollCountResult = await contract.get_poll_count({ simulate: true });
            const pollCount = pollCountResult.result || 0;

            if (pollCount === 0) {
                setActivities([]);
                setIsLoading(false);
                return;
            }

            const pollIdsResult = await contract.get_all_poll_ids({ simulate: true });
            const pollIds = pollIdsResult.result || [];
            
            const newActivities: ActivityItem[] = [];
            
            for (const pollId of pollIds) {
                try {
                    const pollResult = await contract.get_poll({ poll_id: pollId }, { simulate: true });
                    const pollData = pollResult.result;
                    
                    if (pollData) {
                        newActivities.push({
                            type: 'poll_created',
                            pollId: pollData.id,
                            question: pollData.question.toString(),
                            timestamp: Number(pollData.created_at),
                            address: pollData.creator,
                        });
                    }
                } catch (error) {
                    console.error(`Error loading poll ${pollId}:`, error);
                }
            }
            
            // Sort by timestamp (newest first)
            newActivities.sort((a, b) => b.timestamp - a.timestamp);
            
            // Limit to 10 most recent
            setActivities(newActivities.slice(0, 10));
        } catch (error) {
            console.error('Error loading activities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Activity className="text-white" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
                            <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Activity className="text-white" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                </div>
                <button
                    onClick={loadActivities}
                    className="px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg transition text-sm font-medium border border-gray-700/50"
                >
                    Refresh
                </button>
            </div>
            
            {activities.length === 0 ? (
                <div className="text-center py-12">
                    <Activity className="mx-auto text-gray-600 mb-3" size={48} />
                    <p className="text-gray-400 mb-1">No activity yet</p>
                    <p className="text-gray-500 text-sm">Activity will appear here as polls are created</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activities.map((activity, index) => (
                        <div 
                            key={`${activity.pollId}-${index}`}
                            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all"
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    activity.type === 'poll_created' 
                                        ? 'bg-blue-500/20' 
                                        : 'bg-emerald-500/20'
                                }`}>
                                    {activity.type === 'poll_created' ? (
                                        <PlusCircle size={16} className="text-blue-400" />
                                    ) : (
                                        <Vote size={16} className="text-emerald-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white font-medium mb-1">
                                        {activity.type === 'poll_created' ? 'Poll Created' : 'Vote Cast'}
                                    </p>
                                    <p className="text-xs text-gray-400 mb-2 truncate">
                                        {activity.question}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            <span>{formatTime(activity.timestamp)}</span>
                                        </div>
                                        <span className="font-mono">
                                            {activity.address.slice(0, 8)}...{activity.address.slice(-6)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}



