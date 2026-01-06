'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter, useSearchParams } from 'next/navigation';

interface Recipe {
    id: string;
    title: string;
    description: string;
    apps: { name: string; icon: string; color: string }[];
    category: string;
    prompt_template: string;
    is_featured: boolean;
}

// Fallback recipes for when database is not yet set up
const fallbackRecipes: Recipe[] = [
    {
        id: '1',
        title: 'Weekly PRs to Slack',
        description: 'Get a weekly summary of all merged pull requests sent to your Slack channel',
        apps: [
            { name: 'GitHub', icon: 'github', color: '#24292e' },
            { name: 'Slack', icon: 'slack', color: '#4A154B' },
        ],
        category: 'Development',
        prompt_template: 'List all merged pull requests from this week across my GitHub repositories and send a summary to my main Slack channel.',
        is_featured: true
    },
    {
        id: '2',
        title: 'Daily Email Summary',
        description: 'Get a summary of your unread emails every morning',
        apps: [
            { name: 'Gmail', icon: 'gmail', color: '#EA4335' },
        ],
        category: 'Email',
        prompt_template: 'Summarize my unread emails from the last 24 hours. Group them by importance and sender.',
        is_featured: true
    },
    {
        id: '3',
        title: 'Slack & Email To-Do List',
        description: 'Generate a daily to-do list from your Slack messages and emails',
        apps: [
            { name: 'Slack', icon: 'slack', color: '#4A154B' },
            { name: 'Gmail', icon: 'gmail', color: '#EA4335' },
        ],
        category: 'Productivity',
        prompt_template: 'Analyze my Slack messages and emails from today and extract action items into a to-do list.',
        is_featured: true
    },
    {
        id: '4',
        title: 'Daily Standup Report',
        description: 'Compile team updates from Slack into a Notion page automatically',
        apps: [
            { name: 'Slack', icon: 'slack', color: '#4A154B' },
            { name: 'Notion', icon: 'notion', color: '#000000' },
        ],
        category: 'Productivity',
        prompt_template: 'Collect all standup messages from the #standup Slack channel and create a formatted report in Notion.',
        is_featured: false
    },
    {
        id: '5',
        title: 'Auto-respond to Emails',
        description: 'Automatically draft responses to common email inquiries',
        apps: [
            { name: 'Gmail', icon: 'gmail', color: '#EA4335' },
        ],
        category: 'Email',
        prompt_template: 'Check my unread emails and draft professional responses for each one. Show me the drafts before sending.',
        is_featured: false
    },
    {
        id: '6',
        title: 'Calendar to Slack Reminder',
        description: 'Send Slack reminders 15 minutes before calendar events',
        apps: [
            { name: 'Google Calendar', icon: 'calendar', color: '#4285F4' },
            { name: 'Slack', icon: 'slack', color: '#4A154B' },
        ],
        category: 'Productivity',
        prompt_template: 'Check my calendar for upcoming meetings and send me a Slack reminder for each one.',
        is_featured: false
    },
    {
        id: '7',
        title: 'GitHub Issues to Linear',
        description: 'Sync GitHub issues to Linear for project management',
        apps: [
            { name: 'GitHub', icon: 'github', color: '#24292e' },
            { name: 'Linear', icon: 'linear', color: '#5E6AD2' },
        ],
        category: 'Development',
        prompt_template: 'List my open GitHub issues and create corresponding tasks in my Linear workspace.',
        is_featured: false
    },
    {
        id: '8',
        title: 'Social Media Post Creator',
        description: 'Create and schedule posts across social media platforms',
        apps: [
            { name: 'Twitter', icon: 'twitter', color: '#1DA1F2' },
        ],
        category: 'Social Media',
        prompt_template: 'Create an engaging Twitter post about the latest tech news. Make it informative yet engaging.',
        is_featured: false
    },
];

const AppIcon = ({ app }: { app: { name: string; icon: string; color: string } }) => {
    const iconMap: Record<string, React.ReactNode> = {
        github: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
        ),
        slack: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
            </svg>
        ),
        gmail: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
            </svg>
        ),
        notion: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
            </svg>
        ),
        calendar: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
            </svg>
        ),
        reddit: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
            </svg>
        ),
        twitter: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
        linear: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.357 3.357a1.774 1.774 0 0 1 2.509 0l14.777 14.777a1.774 1.774 0 0 1-2.509 2.509L3.357 5.866a1.774 1.774 0 0 1 0-2.509zm4.138 0a1.774 1.774 0 0 1 2.51 0L17.5 10.852V17.5h-6.648L3.357 10.005a1.774 1.774 0 0 1 0-2.51z" />
            </svg>
        ),
        airtable: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M11.992 1.966L2.063 5.613c-.25.092-.25.447 0 .539l9.929 3.647c.25.092.522.092.772 0l9.929-3.647c.25-.092.25-.447 0-.539l-9.929-3.647a1.02 1.02 0 00-.772 0zM2 7.952v8.294c0 .217.138.41.345.48l9.268 3.188c.239.082.494-.09.494-.343V11.38a.5.5 0 00-.345-.476L2.494 7.716c-.239-.082-.494.09-.494.236zm11.887 3.43v8.189c0 .253.255.425.494.343l9.273-3.19c.207-.07.346-.263.346-.48V8.188c0-.146-.255-.318-.494-.236l-9.273 3.188a.5.5 0 00-.346.242z" />
            </svg>
        ),
    };

    return (
        <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: app.color }}
            title={app.name}
        >
            {iconMap[app.icon] || (
                <span className="text-xs font-bold">{app.name.slice(0, 2)}</span>
            )}
        </div>
    );
};

export function LibraryPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Fetch recipes from API on mount
    useEffect(() => {
        async function fetchRecipes() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/api/recipes');

                if (!response.ok) {
                    throw new Error('Failed to fetch recipes');
                }

                const data = await response.json();

                if (data.recipes && data.recipes.length > 0) {
                    setRecipes(data.recipes);
                } else {
                    // Use fallback recipes if database is empty
                    setRecipes(fallbackRecipes);
                }
            } catch (err: any) {
                console.error('Error fetching recipes:', err);
                // Use fallback recipes on error
                setRecipes(fallbackRecipes);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchRecipes();
    }, []);

    const categories = [...new Set(recipes.map(r => r.category))];

    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || recipe.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Handle recipe execution - navigates to chat with the prompt
    const handleTryRecipe = (recipe: Recipe) => {
        // Navigate to chat tab with recipe prompt as initial message
        const params = new URLSearchParams();
        params.set('tab', 'chat');
        params.set('recipe', recipe.id);
        params.set('prompt', encodeURIComponent(recipe.prompt_template));

        router.push(`/?${params.toString()}`);
    };

    if (loading) {
        return (
            <div className="flex-1 h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-neutral-600 dark:text-neutral-400">Loading recipes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 h-screen overflow-y-auto bg-white dark:bg-neutral-950">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                        {t('library.title') || 'Explore Recipes'}
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        {t('library.subtitle') || 'Automate everyday tasks with premade workflows'}
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                            ⚠️ Using local recipes. Database may not be configured yet.
                        </p>
                    </div>
                )}

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder={t('library.searchPlaceholder') || 'Search workflows...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedCategory
                                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                }`}
                        >
                            All
                        </button>
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category
                                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* What's a Recipe Card */}
                <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                                {t('library.whatIsRecipe') || "What's a Recipe?"}
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Recipes are pre-built automations that connect your favorite apps to save time and reduce manual work.
                            </p>
                        </div>
                        <button className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('library.watchDemo') || 'Watch Demo'}
                        </button>
                    </div>
                </div>

                {/* Recipe Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes.map(recipe => (
                        <div
                            key={recipe.id}
                            className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200"
                        >
                            {/* Featured Badge */}
                            {recipe.is_featured && (
                                <div className="mb-3">
                                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                                        ⭐ Featured
                                    </span>
                                </div>
                            )}

                            {/* App Icons */}
                            <div className="flex items-center gap-2 mb-4">
                                {recipe.apps.map((app, index) => (
                                    <AppIcon key={index} app={app} />
                                ))}
                                {recipe.apps.length > 1 && (
                                    <span className="text-neutral-400 dark:text-neutral-600 mx-1">→</span>
                                )}
                            </div>

                            {/* Title & Description */}
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                {recipe.title}
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                                {recipe.description}
                            </p>

                            {/* Category Badge & Try Button */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                                    {recipe.category}
                                </span>
                                <button
                                    onClick={() => handleTryRecipe(recipe)}
                                    className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    {t('library.tryButton') || 'Try'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredRecipes.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No recipes found</h3>
                        <p className="text-neutral-500 dark:text-neutral-400">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
