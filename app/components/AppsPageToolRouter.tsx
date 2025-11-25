// Composio ToolRouter Apps Page
'use client';

import { useState, useEffect } from 'react';
import { AuthWrapper } from './AuthWrapper';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '../context/LanguageContext';

interface App {
    name: string;
    slug: string;
    description: string;
    logo?: string;
    category?: string;
    toolCount?: number;
}

interface ConnectedAccount {
    id: string;
    appName: string;
    status: string;
    createdAt: string;
}

function AppsPageContent({ user }: { user: User }) {
    const { t } = useLanguage();
    const [apps, setApps] = useState<App[]>([]);
    const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'my-apps' | 'marketplace'>('marketplace');

    useEffect(() => {
        fetchAllApps();
        fetchConnectedAccounts();
    }, []);

    const fetchAllApps = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/toolkits');

            if (!response.ok) {
                throw new Error('Failed to fetch apps');
            }

            const data = await response.json();

            const transformedApps: App[] = (data.items || []).map((item: any) => ({
                name: item.name || item.slug,
                slug: item.slug,
                description: item.meta?.description || item.description || 'No description available',
                logo: item.meta?.logo || item.logo,
                category: item.meta?.category || item.category,
                toolCount: item.tools?.length || Math.floor(Math.random() * 20) + 1
            }));

            transformedApps.sort((a, b) => a.name.localeCompare(b.name));
            setApps(transformedApps);
        } catch (error) {
            console.error('Error fetching apps:', error);
            setApps([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchConnectedAccounts = async () => {
        try {
            const response = await fetch('/api/apps/connection');
            if (response.ok) {
                const data = await response.json();
                setConnectedAccounts(data.connectedAccounts || []);
            }
        } catch (error) {
            console.error('Error fetching connected accounts:', error);
        }
    };

    const handleConnect = async (app: App) => {
        try {
            console.log(`[Connect] Initiating connection for ${app.name}...`);

            const response = await fetch('/api/apps/connection/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appSlug: app.slug, entityId: user.id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Connection initiation failed:', errorData);
                throw new Error(`Failed to initiate connection`);
            }

            const data = await response.json();

            if (data.requiresRedirect && data.redirectUrl) {
                const width = 600, height = 700;
                const left = window.screen.width / 2 - width / 2;
                const top = window.screen.height / 2 - height / 2;

                const popup = window.open(
                    data.redirectUrl,
                    'Connect ' + app.name,
                    `width=${width},height=${height},left=${left},top=${top}`
                );

                const connectionId = data.connectedAccountId;
                console.log(`[OAuth] Opened popup, waiting for connection ${connectionId}...`);

                try {
                    const waitResponse = await fetch('/api/apps/connection/wait', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ connectionId })
                    });

                    const waitResult = await waitResponse.json();

                    if (popup && !popup.closed) popup.close();

                    if (waitResult.success && waitResult.status === 'ACTIVE') {
                        console.log(`✅ Connection successful!`);
                        alert(`${app.name} connected successfully!`);
                    } else if (waitResult.status === 'TIMEOUT') {
                        alert(`Connection taking longer. Please check "My Apps" in a moment.`);
                    } else {
                        alert(`Failed to connect ${app.name}. Please try again.`);
                    }
                    fetchConnectedAccounts();
                } catch (waitError) {
                    console.error('Error waiting for connection:', waitError);
                    if (popup && !popup.closed) popup.close();
                    fetchConnectedAccounts();
                }
            } else {
                fetchConnectedAccounts();
            }
        } catch (error) {
            console.error('Error connecting app:', error);
            alert('Failed to connect app. Please try again.');
        }
    };

    const isAppConnected = (appSlug: string) => {
        return connectedAccounts.some(acc =>
            acc.appName && appSlug && acc.appName.toLowerCase() === appSlug.toLowerCase()
        );
    };

    const filteredApps = apps.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.description.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeTab === 'my-apps') {
            return matchesSearch && isAppConnected(app.slug);
        }
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-neutral-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-800 dark:border-white mb-4"></div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">Loading apps...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#FBFAF9] dark:bg-neutral-900 h-full overflow-hidden transition-colors duration-200">
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-8 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                {t('apps.title')}
                            </h1>
                            <div className="flex items-center gap-2 ml-4">
                                <button
                                    onClick={() => setActiveTab('my-apps')}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'my-apps' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'bg-transparent text-neutral-700 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                        }`}
                                >
                                    {t('apps.myApps')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('marketplace')}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'marketplace' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'bg-transparent text-neutral-700 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                        }`}
                                >
                                    {t('apps.marketplace')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m29-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder={t('apps.search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 focus:border-neutral-500 dark:focus:border-neutral-500 outline-none text-sm text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-0">
                        {filteredApps.map((app) => {
                            const isConnected = isAppConnected(app.slug);
                            return (
                                <div key={app.slug} className="group flex items-center justify-between py-4 border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors px-2 -mx-2 rounded-lg">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center flex-shrink-0 p-1.5">
                                                {app.logo ? (
                                                    <img src={app.logo} alt={app.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="text-neutral-600 dark:text-neutral-400 text-xs font-bold">{app.name.slice(0, 2).toUpperCase()}</span>
                                                )}
                                            </div>
                                            {isConnected && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center">
                                                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-8">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{app.name}</h3>
                                                {isConnected && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">Active</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{app.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 mr-4">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-xs font-medium">{app.toolCount || 5}</span>
                                        </div>
                                        <button className="px-4 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-sm font-medium rounded-lg transition-colors">
                                            {t('apps.manage')}
                                        </button>
                                        {isConnected ? (
                                            <button onClick={() => handleConnect(app)} className="px-4 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 hover:text-red-700 dark:hover:text-red-400 text-neutral-800 dark:text-neutral-200 text-sm font-medium rounded-lg transition-all">
                                                {t('apps.disconnect')}
                                            </button>
                                        ) : (
                                            <button onClick={() => handleConnect(app)} className="px-4 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 text-neutral-800 dark:text-neutral-200 text-sm font-medium rounded-lg transition-all shadow-sm">
                                                {t('apps.connect')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredApps.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">No apps found</h3>
                            <p className="text-neutral-600 dark:text-neutral-400 text-sm">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function AppsPage() {
    return (
        <AuthWrapper>
            {(user, loading) => {
                if (loading) {
                    return (
                        <div className="flex-1 flex items-center justify-center bg-white dark:bg-neutral-900">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-800 dark:border-white"></div>
                        </div>
                    );
                }
                if (!user) {
                    return (
                        <div className="flex-1 flex items-center justify-center bg-white dark:bg-neutral-900">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to continue</h2>
                                <a href="/auth" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700">
                                    Sign In
                                </a>
                            </div>
                        </div>
                    );
                }
                return <AppsPageContent user={user} />;
            }}
        </AuthWrapper>
    );
}
