'use client';

import { useState, useEffect } from 'react';
import { AuthWrapper } from './AuthWrapper';
import { User } from '@supabase/supabase-js';

interface Toolkit {
    slug: string;
    name: string;
    meta: {
        description: string;
        logo: string;
    };
}

interface ConnectedAccount {
    id: string;
    toolkit: {
        slug: string;
    };
    status: string;
}

function AppsPageContent({ user: _user }: { user: User }) {
    const [toolkits, setToolkits] = useState<Toolkit[]>([]);
    const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [connecting, setConnecting] = useState<string | null>(null);

    useEffect(() => {
        fetchToolkits();
        fetchConnectedAccounts();
    }, []);

    const fetchToolkits = async () => {
        try {
            const response = await fetch('/api/toolkits');
            if (response.ok) {
                const data = await response.json();
                setToolkits(data.items || []);
            }
        } catch (error) {
            console.error('Error fetching toolkits:', error);
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

    const handleConnect = async (toolkit: Toolkit) => {
        setConnecting(toolkit.slug);

        try {
            // First, create or get auth config for this toolkit
            const authConfigResponse = await fetch('/api/authConfig/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toolkitSlug: toolkit.slug }),
            });

            if (!authConfigResponse.ok) {
                throw new Error('Failed to create auth config');
            }

            const { authConfigId } = await authConfigResponse.json();

            // Then create connection
            const connectionResponse = await fetch('/api/apps/connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    authConfigId,
                    toolkitSlug: toolkit.slug
                }),
            });

            if (!connectionResponse.ok) {
                throw new Error('Failed to create connection');
            }

            const { redirectUrl } = await connectionResponse.json();

            if (redirectUrl) {
                window.open(redirectUrl, '_blank');
                setTimeout(() => fetchConnectedAccounts(), 2000);
            }
        } catch (error) {
            console.error('Error connecting:', error);
            alert(`Failed to connect to ${toolkit.name}`);
        } finally {
            setConnecting(null);
        }
    };

    const handleDisconnect = async (toolkit: Toolkit, account: ConnectedAccount) => {
        setConnecting(toolkit.slug);

        try {
            const response = await fetch('/api/connectedAccounts/disconnect', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId: account.id }),
            });

            if (!response.ok) {
                throw new Error('Failed to disconnect');
            }

            setConnectedAccounts(prev => prev.filter(a => a.id !== account.id));
        } catch (error) {
            console.error('Error disconnecting:', error);
            alert(`Failed to disconnect ${toolkit.name}`);
        } finally {
            setConnecting(null);
        }
    };

    const filteredToolkits = toolkits.filter(toolkit =>
        toolkit.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getActionButton = (toolkit: Toolkit) => {
        const isConnecting = connecting === toolkit.slug;
        const connectedAccount = connectedAccounts.find(
            account => account.toolkit?.slug?.toLowerCase() === toolkit.slug.toLowerCase()
        );
        const isConnected = !!connectedAccount;

        if (isConnecting) {
            return (
                <button disabled className="text-neutral-400 text-sm font-medium flex items-center gap-1">
                    Connecting...
                </button>
            );
        }

        if (isConnected && connectedAccount) {
            return (
                <button
                    onClick={() => handleDisconnect(toolkit, connectedAccount)}
                    className="text-neutral-400 hover:text-neutral-600 text-sm font-medium"
                >
                    Disconnect
                </button>
            );
        }

        return (
            <button
                onClick={() => handleConnect(toolkit)}
                className="bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
                Connect
            </button>
        );
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#fcfaf9' }}>
                <div className="text-neutral-600">Loading apps...</div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col" style={{ backgroundColor: '#fcfaf9' }}>
            <div className="flex-1 overflow-y-auto pb-8">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl font-semibold text-neutral-700">Your Apps</h1>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search apps"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-neutral-400 outline-none text-sm"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-neutral-600 text-sm">
                            Connected Apps: {connectedAccounts.length}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-stone-200">
                        {filteredToolkits.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-neutral-500">No apps found</div>
                            </div>
                        ) : (
                            <div className="divide-y divide-stone-200">
                                {filteredToolkits.map((toolkit) => (
                                    <div key={toolkit.slug} className="p-6 flex items-center justify-between hover:bg-stone-50">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                                                {toolkit.meta.logo ? (
                                                    <img
                                                        src={toolkit.meta.logo}
                                                        alt={toolkit.name}
                                                        className="w-8 h-8 object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-orange-500 text-lg font-semibold">
                                                        {toolkit.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                                                    {toolkit.name}
                                                </h3>
                                                <p className="text-neutral-600 text-sm">
                                                    {toolkit.meta.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {getActionButton(toolkit)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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
                        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#fcfaf9' }}>
                            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                        </div>
                    );
                }

                if (!user) {
                    return (
                        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#fcfaf9' }}>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to continue</h2>
                                <a
                                    href="/auth"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700"
                                >
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
