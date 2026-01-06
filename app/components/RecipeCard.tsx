'use client';

import { useRouter } from 'next/navigation';

interface Recipe {
    id: string;
    title: string;
    description: string;
    prompt: string;
    icon: React.ReactNode;
    color: string;
}

interface RecipeCardProps {
    recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
    const router = useRouter();

    const handleRun = () => {
        // Navigate to chat with the prompt as a query parameter or state
        // For now, we'll use a query parameter. You might want to handle this differently in the Chat page.
        const encodedPrompt = encodeURIComponent(recipe.prompt);
        router.push(`/?prompt=${encodedPrompt}`);
    };

    return (
        <div className="glass-card p-6 rounded-2xl flex flex-col h-full group hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${recipe.color} bg-opacity-10 text-opacity-100`}>
                <div className="text-2xl">
                    {recipe.icon}
                </div>
            </div>

            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {recipe.title}
            </h3>

            <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-6 flex-1">
                {recipe.description}
            </p>

            <button
                onClick={handleRun}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run Recipe
            </button>
        </div>
    );
}
