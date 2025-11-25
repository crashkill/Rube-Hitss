'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from './components/Sidebar';
import { ChatPage } from './components/ChatPageWithAuth';
import { AppsPage } from './components/AppsPageToolRouter';
import { RecipesPage } from './components/RecipesPage';
import { UseRubePage } from './components/UseRubePage';
import { AuthWrapper } from './components/AuthWrapper';
import { LanguageProvider } from './context/LanguageContext';

function HomeContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['chat', 'apps', 'recipes', 'use-rube'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatPage />;
      case 'apps':
        return <AppsPage />;
      case 'recipes':
        return <RecipesPage />;
      case 'use-rube':
        return <UseRubePage />;
      default:
        return <ChatPage />;
    }
  };

  return (
    <LanguageProvider>
      <AuthWrapper>
        {(user) => {
          if (!user) return null;
          return (
            <div className="flex h-screen bg-white">
              {/* Sidebar */}
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} />

              {/* Main Content Area */}
              <main className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden relative">
                {renderContent()}
              </main>
            </div>
          );
        }}
      </AuthWrapper>
    </LanguageProvider>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fcfaf9' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
