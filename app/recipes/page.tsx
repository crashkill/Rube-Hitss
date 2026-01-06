'use client';

import { RecipeCard } from '../components/RecipeCard';
import { AuthWrapper } from '../components/AuthWrapper';

const RECIPES = [
    {
        id: 'github-summary',
        title: 'GitHub PR Summary',
        description: 'Get a summary of open pull requests in a repository and identify blocking issues.',
        prompt: 'List all open pull requests in the repository [owner/repo] and summarize them. Identify any PRs that have been open for more than 7 days.',
        icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
        ),
        color: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white',
    },
    {
        id: 'gmail-briefing',
        title: 'Daily Email Briefing',
        description: 'Summarize unread emails from the last 24 hours and draft replies to important ones.',
        prompt: 'Find all unread emails from the last 24 hours. Summarize the most important ones and draft a reply for any that require immediate attention.',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    },
    {
        id: 'slack-standup',
        title: 'Slack Standup Report',
        description: 'Generate a standup report based on your recent GitHub activity and post it to Slack.',
        prompt: 'Check my GitHub activity for the last 24 hours. Generate a daily standup report in the format: "Yesterday: [tasks], Today: [plans], Blockers: [issues]". Then post this to the #general channel on Slack.',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        ),
        color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
        id: 'calendar-prep',
        title: 'Meeting Prep',
        description: 'Prepare for upcoming meetings by finding relevant emails and documents.',
        prompt: 'Check my Google Calendar for meetings today. For each meeting, search my emails and Google Drive for relevant documents and summarize them.',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
];

export default function RecipesPage() {
    return (
        <AuthWrapper>
            {(user, loading) => {
                if (loading) {
                    return (
                        <div className="flex-1 flex items-center justify-center bg-neutral-50/50">
                            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                        </div>
                    );
                }

                if (!user) {
                    return (
                        <div className="flex-1 flex items-center justify-center bg-neutral-50/50">
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

                return (
                    <div className="flex-1 flex flex-col bg-neutral-50/50 min-h-screen">
                        <div className="flex-1 overflow-y-auto">
                            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-8">
                                {/* Header Section */}
                                <div className="mb-8">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Recipes</h1>
                                    <p className="text-neutral-500 mt-1">Automate complex workflows with one-click recipes.</p>
                                </div>

                                {/* Grid Layout */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                    {RECIPES.map((recipe) => (
                                        <RecipeCard key={recipe.id} recipe={recipe} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }}
        </AuthWrapper>
    );
}
