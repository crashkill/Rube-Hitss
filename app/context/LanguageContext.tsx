'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'pt';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    en: {
        'sidebar.newChat': 'New chat',
        'sidebar.apps': 'Apps',
        'sidebar.recipes': 'Recipes',
        'sidebar.useRube': 'Use Rube',
        'sidebar.recents': 'Recents',
        'sidebar.admin': 'Admin',
        'sidebar.language': 'Language',
        'sidebar.profile': 'Profile',

        'apps.title': 'Available Apps',
        'apps.subtitle': 'Connect to 500+ apps using the Tool Router. Simply ask in the chat to connect any app!',
        'apps.search': 'Search apps',
        'apps.myApps': 'My Apps',
        'apps.marketplace': 'Marketplace',
        'apps.connect': 'Connect',
        'apps.manage': 'Manage',
        'apps.disconnect': 'Disconnect',
        'apps.connectViaChat': 'Connect via Chat',
        'apps.howTo': 'How to Connect Apps',
        'apps.howToDesc': 'Go to the Chat tab and ask: "Connect my Gmail account". The Tool Router will handle authentication automatically!',

        'recipes.title': 'Recipes',
        'recipes.subtitle': 'Automate complex workflows with pre-built recipes.',
        'recipes.comingSoon': 'Coming Soon',
        'recipes.desc': 'Recipes allow you to chain multiple apps together to create powerful automations.',

        'useRube.title': 'Use Rube',
        'useRube.subtitle': 'Learn how to get the most out of Rube.',
        'useRube.guide': 'User Guide',
        'useRube.desc': 'Discover tips, tricks, and best practices for using Rube effectively.',

        'admin.title': 'Administration',
        'admin.languageSettings': 'Language Settings',
        'admin.selectLanguage': 'Select Interface Language',
    },
    pt: {
        'sidebar.newChat': 'Novo chat',
        'sidebar.apps': 'Apps',
        'sidebar.recipes': 'Receitas',
        'sidebar.useRube': 'Usar Rube',
        'sidebar.recents': 'Recentes',
        'sidebar.admin': 'Administração',
        'sidebar.language': 'Idioma',
        'sidebar.profile': 'Perfil',

        'apps.title': 'Apps Disponíveis',
        'apps.subtitle': 'Conecte-se a mais de 500 apps usando o Tool Router. Peça no chat para conectar qualquer app!',
        'apps.search': 'Buscar apps',
        'apps.myApps': 'Meus Apps',
        'apps.marketplace': 'Marketplace',
        'apps.connect': 'Conectar',
        'apps.manage': 'Gerenciar',
        'apps.disconnect': 'Desconectar',
        'apps.connectViaChat': 'Conectar via Chat',
        'apps.howTo': 'Como Conectar Apps',
        'apps.howToDesc': 'Vá para a aba Chat e peça: "Conecte minha conta do Gmail". O Tool Router gerencia a autenticação automaticamente!',

        'recipes.title': 'Receitas',
        'recipes.subtitle': 'Automatize fluxos complexos com receitas pré-construídas.',
        'recipes.comingSoon': 'Em Breve',
        'recipes.desc': 'Receitas permitem encadear vários apps para criar automações poderosas.',

        'useRube.title': 'Usar Rube',
        'useRube.subtitle': 'Aprenda como tirar o máximo proveito do Rube.',
        'useRube.guide': 'Guia do Usuário',
        'useRube.desc': 'Descubra dicas, truques e melhores práticas para usar o Rube efetivamente.',

        'admin.title': 'Administração',
        'admin.languageSettings': 'Configurações de Idioma',
        'admin.selectLanguage': 'Selecione o Idioma da Interface',
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: string) => {
        return translations[language][key as keyof typeof translations['en']] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
