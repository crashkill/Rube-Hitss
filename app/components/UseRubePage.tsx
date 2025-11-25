'use client';

import { useLanguage } from '../context/LanguageContext';

export function UseRubePage() {
    const { t } = useLanguage();

    return (
        <div className="flex-1 flex flex-col bg-[#FBFAF9] dark:bg-neutral-900 h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-neutral-800 flex items-center gap-2">
                            <svg className="w-6 h-6 text-neutral-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {t('useRube.title')}
                        </h1>
                        <p className="text-neutral-500 mt-2">{t('useRube.subtitle')}</p>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">{t('useRube.guide')}</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-neutral-600">1</div>
                                <div>
                                    <h3 className="font-medium text-neutral-900">Connect your Apps</h3>
                                    <p className="text-neutral-500 text-sm">Go to the Apps tab and browse available integrations. Connect the ones you use most.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-neutral-600">2</div>
                                <div>
                                    <h3 className="font-medium text-neutral-900">Start a Chat</h3>
                                    <p className="text-neutral-500 text-sm">Ask Rube to perform tasks like "Summarize my unread emails" or "Create a task in Asana".</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-neutral-600">3</div>
                                <div>
                                    <h3 className="font-medium text-neutral-900">Automate with Recipes</h3>
                                    <p className="text-neutral-500 text-sm">Use recipes to chain multiple actions together for complex workflows.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
