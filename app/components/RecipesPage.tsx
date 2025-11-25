'use client';

import { useLanguage } from '../context/LanguageContext';

export function RecipesPage() {
    const { t } = useLanguage();

    return (
        <div className="flex-1 flex flex-col bg-[#FBFAF9] dark:bg-neutral-900 h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-neutral-800 flex items-center gap-2">
                            <svg className="w-6 h-6 text-neutral-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            {t('recipes.title')}
                        </h1>
                        <p className="text-neutral-500 mt-2">{t('recipes.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Placeholder Card 1 */}
                        <div className="border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-neutral-900">Email Summarizer</h3>
                            </div>
                            <p className="text-neutral-500 text-sm mb-4">
                                Automatically summarize daily emails and send a digest to Slack.
                            </p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                                Gmail + Slack
                            </span>
                        </div>

                        {/* Placeholder Card 2 */}
                        <div className="border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-neutral-900">PR Reviewer</h3>
                            </div>
                            <p className="text-neutral-500 text-sm mb-4">
                                Analyze new GitHub Pull Requests and post comments with suggestions.
                            </p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                                GitHub + OpenAI
                            </span>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <div className="inline-block p-4 bg-orange-50 rounded-full mb-4">
                            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-neutral-900">{t('recipes.comingSoon')}</h3>
                        <p className="text-neutral-500 mt-2 max-w-md mx-auto">
                            {t('recipes.desc')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
