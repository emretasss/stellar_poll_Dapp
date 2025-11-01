'use client';

import React from 'react';
import { TrendingUp, Users, BarChart3, Clock } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color: 'blue' | 'purple' | 'green' | 'orange';
}

export default function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
    const colorClasses = {
        blue: 'from-blue-500 to-cyan-500',
        purple: 'from-purple-500 to-pink-500',
        green: 'from-emerald-500 to-teal-500',
        orange: 'from-orange-500 to-red-500',
    };

    const bgGradient = {
        blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
        purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/20',
        green: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
        orange: 'from-orange-500/10 to-red-500/10 border-orange-500/20',
    };

    return (
        <div className={`group relative bg-gradient-to-br ${bgGradient[color]} border rounded-2xl p-6 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <Icon className="text-white" size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        trend.isPositive 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                        <TrendingUp size={12} className={trend.isPositive ? '' : 'rotate-180'} />
                        <span>{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
        </div>
    );
}

export function StatsGrid({ totalPolls = 0, totalVotes = 0, activeVoters = 0, isLoading = false }: { totalPolls?: number; totalVotes?: number; activeVoters?: number; isLoading?: boolean }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="Total Polls"
                value={isLoading ? "..." : totalPolls.toString()}
                icon={BarChart3}
                trend={undefined}
                color="blue"
            />
            <StatCard
                title="Active Voters"
                value={isLoading ? "..." : activeVoters.toLocaleString()}
                icon={Users}
                trend={undefined}
                color="green"
            />
            <StatCard
                title="Total Votes"
                value={isLoading ? "..." : totalVotes.toLocaleString()}
                icon={TrendingUp}
                trend={undefined}
                color="purple"
            />
            <StatCard
                title="Network"
                value="Testnet"
                icon={Clock}
                trend={undefined}
                color="orange"
            />
        </div>
    );
}
