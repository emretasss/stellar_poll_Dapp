'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
    LayoutDashboard, 
    PlusCircle, 
    BarChart3, 
    Settings, 
    Users,
    TrendingUp,
    Menu,
    X,
    Sparkles
} from 'lucide-react';

interface SidebarProps {
    currentPage: string;
    onPageChange: (page: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export default function Sidebar({ currentPage, onPageChange, isOpen, onToggle }: SidebarProps) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'create', label: 'Create Poll', icon: PlusCircle },
        { id: 'polls', label: 'All Polls', icon: BarChart3 },
        { id: 'stats', label: 'Statistics', icon: TrendingUp },
        { id: 'users', label: 'Voters', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={onToggle}
                className="fixed top-6 left-6 z-50 lg:hidden bg-gradient-to-br from-gray-800 to-gray-900 text-white p-3 rounded-xl shadow-xl border border-gray-700/50 hover:scale-110 transition-all duration-200"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-40
                    w-72 bg-gradient-to-b from-gray-900/95 via-gray-800/95 to-gray-900/95
                    backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out
                    border-r border-gray-700/50
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-transparent">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                <Sparkles className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                                    Stellar Poll
                                </h1>
                                <p className="text-xs text-gray-400 font-medium">Decentralized Voting</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.id;
                            
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onPageChange(item.id);
                                        if (window.innerWidth < 1024) {
                                            onToggle();
                                        }
                                    }}
                                    className={`
                                        group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                        transition-all duration-200 overflow-hidden
                                        ${
                                            isActive
                                                ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                                                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                        }
                                    `}
                                >
                                    <Icon size={20} className={`${isActive ? 'scale-110' : ''} transition-transform duration-200`} />
                                    <span className="font-semibold">{item.label}</span>
                                    {isActive && (
                                        <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-transparent">
                        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-3 backdrop-blur-sm">
                            <p className="text-xs text-gray-400 mb-1 font-medium">Network</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <p className="text-sm font-bold text-emerald-400">Testnet</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
                    onClick={onToggle}
                />
            )}
        </>
    );
}
