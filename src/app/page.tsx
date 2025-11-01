'use client';

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import WalletConnect from './components/WalletConnect';
import { StatsGrid } from './components/StatsCard';
import Dashboard from './components/Dashboard';
import CreatePollPage from './components/CreatePollPage';

export default function Home() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState({ totalPolls: 0, totalVotes: 0, activeVoters: 0 });

    // Listen for navigation events
    React.useEffect(() => {
        const handleNavigate = (e: CustomEvent) => {
            setCurrentPage(e.detail);
        };
        window.addEventListener('navigate', handleNavigate as EventListener);
        return () => window.removeEventListener('navigate', handleNavigate as EventListener);
    }, []);

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'create':
                return <CreatePollPage />;
            case 'polls':
                return <Dashboard />; // Will be replaced with PollsList component
            case 'stats':
                return <Dashboard />; // Will be replaced with Stats component
            case 'users':
                return <div className="text-white">Users page coming soon...</div>;
            case 'settings':
                return <div className="text-white">Settings page coming soon...</div>;
            default:
                return <Dashboard />;
        }
    };

  return (
            <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
                <Sidebar 
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
                    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                        {/* Top Bar */}
                        <div className="mb-8">
                            <WalletConnect />
                        </div>

                        {/* Stats Grid */}
                        {currentPage === 'dashboard' && (
                            <div className="mb-8">
                                <StatsGrid 
                                    totalPolls={stats.totalPolls} 
                                    totalVotes={stats.totalVotes} 
                                    activeVoters={stats.activeVoters} 
                                    isLoading={false} 
                                />
                            </div>
                        )}

                        {/* Page Content */}
                        <div className="mt-6">
                            {currentPage === 'dashboard' ? (
                                <Dashboard 
                                    onStatsUpdate={setStats}
                                    onCreatePoll={() => setCurrentPage('create')}
                                />
                            ) : renderPage()}
                        </div>
                    </div>
                </main>
    </div>
  );
}
