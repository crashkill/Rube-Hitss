'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to get the initial theme
function getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'system';

    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'system';
}

// Helper function to apply theme to DOM
function applyThemeToDOM(theme: Theme) {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
    } else {
        root.classList.add(theme);
    }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);
    const [mounted, setMounted] = useState(false);

    // Apply theme immediately on mount
    useEffect(() => {
        setMounted(true);
        applyThemeToDOM(theme);
    }, []);

    // Apply theme whenever it changes
    useEffect(() => {
        if (!mounted) return;

        applyThemeToDOM(theme);
        localStorage.setItem('theme', theme);

        // Listen for system changes if theme is 'system'
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyThemeToDOM('system');
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme, mounted]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// Script to inject in the head to prevent FOUC
export const ThemeScript = () => {
    const themeScript = `
        (function() {
            try {
                const theme = localStorage.getItem('theme') || 'system';
                const root = document.documentElement;
                
                root.classList.remove('light', 'dark');
                
                if (theme === 'system') {
                    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    root.classList.add(systemTheme);
                } else {
                    root.classList.add(theme);
                }
            } catch (e) {
                console.error('Error applying theme:', e);
            }
        })();
    `;

    return (
        <script
            dangerouslySetInnerHTML={{ __html: themeScript }}
            suppressHydrationWarning
        />
    );
};
