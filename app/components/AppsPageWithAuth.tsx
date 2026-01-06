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

interface AuthConfig {
  id: string;
  name: string;
  toolkit: string | { slug: string };
}

interface ConnectedToolkit {
  toolkit: Toolkit;
  authConfig: AuthConfig;
}

interface AuthConfigResponse {
  items: AuthConfig[];
}

interface ConnectedAccount {
  id: string;
  toolkit: {
    slug: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

function AppsPageContent({ user: _user }: { user: User }) {
  const [toolkits, setToolkits] = useState<ConnectedToolkit[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConnected, setShowConnected] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchAppsData();
  }, []);

  // Refresh connection data when component mounts (e.g., after OAuth callback)
  useEffect(() => {
    const refreshConnections = () => {
      console.log('Refreshing connection status...');
      fetchConnectedAccounts();
    };

    // Refresh immediately when component mounts
    refreshConnections();

    // Check for callback parameters in URL
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const connectedAccountId = params.get('connectedAccountId');

    if (status === 'success' && connectedAccountId) {
      console.log('Detected successful connection callback:', connectedAccountId);
      // Notify opener if this is a popup
      if (window.opener) {
        window.opener.postMessage({ type: 'connectionSuccess', detail: { connectedAccountId } }, '*');
        window.close();
      } else {
        // Just refresh if in same window
        refreshConnections();
        // Clear params to avoid loop/confusion
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    // Listen for connection success events from callback page
    const handleConnectionSuccess = (event: CustomEvent) => {
      console.log('Connection success event received:', event.detail);
      setTimeout(() => {
        refreshConnections();
      }, 1000); // Small delay to ensure backend is updated
    };

    // Listen for postMessage from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'connectionSuccess') {
        console.log('Received connection success message from popup:', event.data.detail);
        setTimeout(() => {
          refreshConnections();
        }, 1000);
      }
    };

    // Also refresh when the window gains focus (user returns from OAuth popup)
    window.addEventListener('focus', refreshConnections);
    window.addEventListener('connectionSuccess', handleConnectionSuccess as EventListener);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('focus', refreshConnections);
      window.removeEventListener('connectionSuccess', handleConnectionSuccess as EventListener);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const fetchConnectedAccounts = async () => {
    try {
      const response = await fetch('/api/apps/connection');
      if (response.ok) {
        const data = await response.json();
        setConnectedAccounts(data.connectedAccounts || []);
      } else {
        console.warn('Failed to fetch connected accounts');
      }
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
    }
  };

  const fetchAppsData = async () => {
    try {
      // Step 1: Fetch auth configs and connected accounts in parallel
      const [authConfigsResponse, connectionStatusResponse] = await Promise.all([
        fetch('/api/authConfig/all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }),
        fetch('/api/apps/connection')
      ]);

      if (!authConfigsResponse.ok) {
        throw new Error('Failed to fetch auth configs');
      }

      const authConfigsData: AuthConfigResponse = await authConfigsResponse.json();
      const connectionData = connectionStatusResponse.ok
        ? await connectionStatusResponse.json()
        : { connectedAccounts: [] };

      console.log('Received auth configs:', authConfigsData.items?.length || 0, 'items');
      console.log('Received connection data:', connectionData.connectedAccounts?.length || 0, 'accounts');

      // Store connected accounts for use in connection status
      setConnectedAccounts(connectionData.connectedAccounts || []);

      if (!authConfigsData.items || authConfigsData.items.length === 0) {
        console.log('No auth configs found');
        setToolkits([]);
        return;
      }

      // Filter auth configs to only include those with 'toolRouter' in their name
      const toolRouterConfigs = authConfigsData.items.filter(config =>
        config.name && config.name.toLowerCase().includes('toolrouter')
      );

      console.log('Filtered toolRouter configs:', toolRouterConfigs);

      if (toolRouterConfigs.length === 0) {
        console.log('No toolRouter auth configs found');
        setToolkits([]);
        return;
      }

      // Step 2: For each filtered auth config, fetch the toolkit details
      const appPromises = toolRouterConfigs.map(async (authConfig) => {
        try {
          // Handle both string and object formats for toolkit
          const toolkitSlug = typeof authConfig.toolkit === 'string'
            ? authConfig.toolkit
            : authConfig.toolkit.slug;

          console.log(`Fetching toolkit details for: ${toolkitSlug}`);

          const toolkitResponse = await fetch('/api/toolkit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ toolkit: toolkitSlug }),
          });

          if (!toolkitResponse.ok) {
            console.warn(`Failed to fetch toolkit details for ${toolkitSlug}`);
            return null;
          }

          const toolkitData = await toolkitResponse.json();

          return {
            toolkit: {
              slug: toolkitData.slug,
              name: toolkitData.name,
              meta: toolkitData.meta
            },
            authConfig
          } as ConnectedToolkit;
        } catch (error) {
          const toolkitSlug = typeof authConfig.toolkit === 'string'
            ? authConfig.toolkit
            : authConfig.toolkit.slug;
          console.warn(`Error fetching toolkit ${toolkitSlug}:`, error);
          return null;
        }
      });

      const toolkitResults = await Promise.all(appPromises);
      const validToolkits = toolkitResults.filter((toolkit): toolkit is ConnectedToolkit => toolkit !== null);

      console.log('Final toolkits with details:', validToolkits);
      setToolkits(validToolkits);
    } catch (error) {
      console.error('Error fetching apps data:', error);
      setToolkits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (toolkit: ConnectedToolkit) => {
    setConnecting(toolkit.toolkit.slug);

    try {
      const authConfigId = toolkit.authConfig.id;

      const response = await fetch('/api/apps/connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authConfigId,
          toolkitSlug: toolkit.toolkit.slug
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create auth link: ${response.status}`);
      }

      const connectionRequest = await response.json();

      if (connectionRequest.redirectUrl) {
        window.open(connectionRequest.redirectUrl, '_blank');

        // Refresh connection status after a short delay to account for the connection
        setTimeout(() => {
          fetchConnectedAccounts();
        }, 2000);
      } else {
        console.error('No redirect URL received');
      }

    } catch (error) {
      console.error('Error connecting toolkit:', error);
      alert(`Failed to connect to ${toolkit.toolkit.name}: ${error}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (toolkit: ConnectedToolkit, connectedAccount: ConnectedAccount) => {
    setConnecting(toolkit.toolkit.slug);

    try {
      console.log(`Disconnecting ${toolkit.toolkit.name}...`);

      const response = await fetch('/api/connectedAccounts/disconnect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: connectedAccount.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to disconnect: ${response.status}`);
      }

      const result = await response.json();
      console.log('Disconnect result:', result);

      // Immediately update the connected accounts list to remove the disconnected account
      setConnectedAccounts(prev =>
        prev.filter(account => account.id !== connectedAccount.id)
      );

      // Also refresh from server to ensure sync
      setTimeout(() => {
        fetchConnectedAccounts();
      }, 500);

      console.log(`Successfully disconnected ${toolkit.toolkit.name}`);

    } catch (error) {
      console.error('Error disconnecting toolkit:', error);
      alert(`Failed to disconnect ${toolkit.toolkit.name}: ${error}`);
    } finally {
      setConnecting(null);
    }
  };

  const filteredToolkits = (toolkits || []).filter((toolkit: ConnectedToolkit) =>
    toolkit.toolkit.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getActionButton = (toolkit: ConnectedToolkit) => {
    const isConnecting = connecting === toolkit.toolkit.slug;

    // Check if this toolkit is connected by looking for a connected account with matching toolkit slug
    const isConnected = connectedAccounts.some(account =>
      account.toolkit?.slug?.toLowerCase() === toolkit.toolkit.slug.toLowerCase()
    );

    // Find the connected account for disconnect functionality
    const connectedAccount = connectedAccounts.find(account =>
      account.toolkit?.slug?.toLowerCase() === toolkit.toolkit.slug.toLowerCase()
    );

    if (isConnecting) {
      return (
        <button
          disabled
          className="w-full py-2 px-3 rounded-lg bg-neutral-100 text-neutral-400 text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Connecting
        </button>
      );
    }

    if (isConnected && connectedAccount) {
      return (
        <button
          onClick={() => handleDisconnect(toolkit, connectedAccount)}
          className="w-full py-2 px-3 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 text-sm font-medium flex items-center justify-center gap-2 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Connected
        </button>
      );
    } else {
      return (
        <button
          onClick={() => handleConnect(toolkit)}
          className="w-full py-2 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow"
        >
          Connect
        </button>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto p-4 sm:p-8">
          <div className="flex flex-col gap-8">
            <div className="h-8 w-48 bg-neutral-200 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-48 bg-white rounded-2xl border border-neutral-200 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-neutral-50/50 min-h-screen">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Integrations</h1>
              <p className="text-neutral-500 mt-1">Connect your favorite tools to supercharge your AI agent.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group">
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900/5 focus:border-neutral-900/10 outline-none text-sm text-neutral-700 shadow-sm transition-all placeholder:text-neutral-400"
                />
              </div>

              <button
                onClick={() => setShowConnected(!showConnected)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${showConnected
                  ? 'bg-neutral-900 text-white border-transparent shadow-md'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                  }`}
              >
                Connected ({connectedAccounts.length})
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-20">
            {filteredToolkits.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900">No apps found</h3>
                <p className="text-neutral-500 mt-1">Try adjusting your search query</p>
              </div>
            ) : (
              filteredToolkits.map((toolkit: ConnectedToolkit) => (
                <div
                  key={`${toolkit.toolkit.slug}-${toolkit.authConfig.id}`}
                  className="glass-card p-5 rounded-2xl flex flex-col h-full group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-white rounded-xl border border-neutral-100 shadow-sm flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300">
                      {toolkit.toolkit.meta.logo ? (
                        <img
                          src={toolkit.toolkit.meta.logo}
                          alt={toolkit.toolkit.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <span className={`text-xl font-bold text-neutral-900 ${toolkit.toolkit.meta.logo ? 'hidden' : ''}`}>
                        {getInitial(toolkit.toolkit.name)}
                      </span>
                    </div>
                    {/* Optional: Add status indicator or category icon here */}
                  </div>

                  <div className="flex-1 mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {toolkit.toolkit.name}
                    </h3>
                    <p className="text-neutral-500 text-sm leading-relaxed line-clamp-2">
                      {toolkit.toolkit.meta.description || `Connect ${toolkit.toolkit.name} to your AI agent.`}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-neutral-100">
                    {getActionButton(toolkit)}
                  </div>
                </div>
              ))
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