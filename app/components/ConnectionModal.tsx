'use client';

import { useState } from 'react';

interface ConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    appName: string;
    appSlug: string;
    authType: 'api_key' | 'oauth2' | 'bearer_token';
    onSubmit: (credentials: Record<string, string>) => Promise<void>;
}

export function ConnectionModal({
    isOpen,
    onClose,
    appName,
    appSlug,
    authType,
    onSubmit
}: ConnectionModalProps) {
    const [credentials, setCredentials] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setError('');

        try {
            await onSubmit(credentials);
            // Reset form
            setCredentials({});
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setCredentials({});
            setError('');
            onClose();
        }
    };

    const renderFields = () => {
        switch (authType) {
            case 'api_key':
                return (
                    <div className="mb-4">
                        <label htmlFor="apiKey" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                            {appName} API Key *
                        </label>
                        <input
                            id="apiKey"
                            type="password"
                            value={credentials.apiKey || ''}
                            onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                            placeholder="Enter your API key"
                            disabled={loading}
                            className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                );

            case 'bearer_token':
                return (
                    <div className="mb-4">
                        <label htmlFor="token" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                            Bearer Token *
                        </label>
                        <input
                            id="token"
                            type="password"
                            value={credentials.token || ''}
                            onChange={(e) => setCredentials({ ...credentials, token: e.target.value })}
                            placeholder="Enter your bearer token"
                            disabled={loading}
                            className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                );

            case 'oauth2':
                return (
                    <>
                        <div className="mb-4">
                            <label htmlFor="clientId" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                                Client ID *
                            </label>
                            <input
                                id="clientId"
                                type="text"
                                value={credentials.clientId || ''}
                                onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
                                placeholder="e.g., 123456789-abc.apps.googleusercontent.com"
                                disabled={loading}
                                className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="clientSecret" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                                Client Secret *
                            </label>
                            <input
                                id="clientSecret"
                                type="password"
                                value={credentials.clientSecret || ''}
                                onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
                                placeholder="e.g., GOCSPX-abc123xyz"
                                disabled={loading}
                                className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    const isFormValid = () => {
        switch (authType) {
            case 'api_key':
                return credentials.apiKey?.trim();
            case 'bearer_token':
                return credentials.token?.trim();
            case 'oauth2':
                return credentials.clientId?.trim() && credentials.clientSecret?.trim();
            default:
                return false;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        Connect {appName}
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="px-6 py-5">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        Provide the required details to connect your account.
                    </p>

                    {renderFields()}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !isFormValid()}
                            className="flex-1 px-4 py-2.5 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 dark:border-neutral-900/30 border-t-white dark:border-t-neutral-900 rounded-full animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                'Connect'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
