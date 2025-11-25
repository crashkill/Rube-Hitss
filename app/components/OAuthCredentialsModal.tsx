'use client';

import { useState } from 'react';

interface OAuthCredentialsModalProps {
    isOpen: boolean;
    onClose: () => void;
    appName: string;
    appSlug: string;
    onSubmit: (clientId: string, clientSecret: string) => Promise<void>;
}

export function OAuthCredentialsModal({
    isOpen,
    onClose,
    appName,
    appSlug,
    onSubmit
}: OAuthCredentialsModalProps) {
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!clientId.trim() || !clientSecret.trim()) {
            setError('Please fill in both Client ID and Client Secret');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onSubmit(clientId, clientSecret);
            // Reset form
            setClientId('');
            setClientSecret('');
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setClientId('');
            setClientSecret('');
            setError('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                                OAuth Credentials Required
                            </h2>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                {appName} requires custom OAuth credentials
                            </p>
                        </div>
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
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="px-6 py-5">
                    {/* Info Box */}
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex gap-3">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-blue-900 dark:text-blue-100">
                                <p className="font-medium mb-1">How to get these credentials:</p>
                                <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                                    <li>Go to your cloud provider's console</li>
                                    <li>Create an OAuth application</li>
                                    <li>Copy the Client ID and Client Secret</li>
                                    <li>Paste them below</li>
                                </ol>
                                <a
                                    href="/COMO_CONFIGURAR_APPS.md"
                                    target="_blank"
                                    className="inline-flex items-center gap-1 mt-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                    View detailed guide
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Client ID */}
                    <div className="mb-4">
                        <label htmlFor="clientId" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                            Client ID
                        </label>
                        <input
                            id="clientId"
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            placeholder="e.g., 123456789-abc.apps.googleusercontent.com"
                            disabled={loading}
                            className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Client Secret */}
                    <div className="mb-4">
                        <label htmlFor="clientSecret" className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                            Client Secret
                        </label>
                        <input
                            id="clientSecret"
                            type="password"
                            value={clientSecret}
                            onChange={(e) => setClientSecret(e.target.value)}
                            placeholder="e.g., GOCSPX-abc123xyz"
                            disabled={loading}
                            className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    )}

                    {/* Redirect URI Info */}
                    <div className="mb-6 p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Authorized Redirect URI:
                        </p>
                        <code className="text-xs text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 block">
                            https://backend.composio.dev/api/v3/toolkits/auth/callback
                        </code>
                    </div>

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
                            disabled={loading || !clientId.trim() || !clientSecret.trim()}
                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save & Connect'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
