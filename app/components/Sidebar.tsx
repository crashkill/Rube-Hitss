'use client';

import { User } from '@supabase/supabase-js';
import { RubeGraphic } from './RubeGraphic';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useConversations } from '../hooks/useConversations';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    user: User;
}

export function Sidebar({ activeTab, onTabChange, user }: SidebarProps) {
    const { t, language, setLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClientComponentClient();
    const { conversations, loadConversations } = useConversations();

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth');
    };

    const handleConversationClick = (conversationId: string) => {
        onTabChange('chat');
        router.push(`/?tab=chat&conversation=${conversationId}`);
    };

    return (
        <div className="w-[260px] h-screen bg-[#FBFAF9] dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col fixed left-0 top-0 z-50 transition-colors duration-200">
            {/* Logo Area */}
            <div className="p-4 flex items-center gap-2 mb-2">
                <div className="w-8 h-8 text-neutral-900 dark:text-white">
                    <RubeGraphic />
                </div>
                <span className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Rube</span>
            </div>

            {/* New Chat Button */}
            <div className="px-3 mb-6">
                <button
                    onClick={() => onTabChange('chat')}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-[#FBFAF9] dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 transition-colors text-sm font-medium shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {t('sidebar.newChat')}
                </button>
            </div>

            {/* Main Navigation */}
            <div className="px-3 space-y-0.5 mb-6">
                <button
                    onClick={() => onTabChange('apps')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'apps'
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                        : 'text-neutral-700 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {t('sidebar.apps')}
                </button>

                <button
                    onClick={() => onTabChange('recipes')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${activeTab === 'recipes'
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                        : 'text-neutral-700 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    {t('sidebar.recipes')}
                    <span className="ml-auto text-[10px] font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded">Beta</span>
                </button>

                <button
                    onClick={() => onTabChange('use-rube')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'use-rube'
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                        : 'text-neutral-700 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('sidebar.useRube')}
                </button>

                <button
                    onClick={() => onTabChange('library')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'library'
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                        : 'text-neutral-700 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {t('sidebar.library') || 'Library'}
                </button>
            </div>


            {/* Recents Section */}
            <div className="px-4 mb-2">
                <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-500 uppercase tracking-wider mb-2">{t('sidebar.recents')}</h3>
            </div>
            <div className="flex-1 overflow-y-auto px-3 space-y-0.5 mb-4 scrollbar-hide">
                {conversations.length > 0 ? (
                    conversations.slice(0, 8).map((conversation) => (
                        <button
                            key={conversation.id}
                            onClick={() => handleConversationClick(conversation.id)}
                            className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white rounded-lg truncate transition-colors"
                        >
                            {conversation.title || 'New conversation'}
                        </button>
                    ))
                ) : (
                    <p className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-500 italic">
                        {t('sidebar.noRecents') || 'No recent conversations'}
                    </p>
                )}
            </div>

            {/* User Profile & Menu */}
            <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 relative" ref={menuRef}>

                {/* Popover Menu */}
                {showUserMenu && (
                    <div className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">

                        {/* Credits Section */}
                        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-neutral-900 dark:text-white">Credits</span>
                                <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-300">
                                    7652 / 10000 Used
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-orange-500 to-pink-500 w-[76%] rounded-full" />
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                            <button className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-3 transition-colors">
                                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                Upgrade Plan
                            </button>
                            <button className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-3 transition-colors">
                                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                Activity Logs
                            </button>

                            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />

                            {/* Language Settings */}
                            <div className="px-4 py-2">
                                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-500 uppercase tracking-wider mb-2">Language</p>
                                <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${language === 'en' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
                                    >
                                        English
                                    </button>
                                    <button
                                        onClick={() => setLanguage('pt')}
                                        className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${language === 'pt' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
                                    >
                                        Português
                                    </button>
                                </div>
                            </div>

                            {/* Theme Settings */}
                            <div className="px-4 py-2">
                                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-500 uppercase tracking-wider mb-2">Theme</p>
                                <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${theme === 'light' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
                                        title="Light"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${theme === 'dark' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
                                        title="Dark"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => setTheme('system')}
                                        className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${theme === 'system' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
                                        title="System"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />

                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Log Out
                            </button>
                        </div>
                    </div>
                )}

                {/* User Profile Button */}
                <div
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${showUserMenu ? 'bg-neutral-100 dark:bg-neutral-800' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {user.email?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                            {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                            {user.email}
                        </p>
                    </div>
                    <svg className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
