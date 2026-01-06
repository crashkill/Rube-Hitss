'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from './components/Sidebar';
import { ChatPage } from './components/ChatPageWithAuth';
import { AppsPage } from './components/AppsPageToolRouter';
import { RecipesPage } from './components/RecipesPage';
import { UseRubePage } from './components/UseRubePage';
import { LibraryPage } from './components/LibraryPage';
import { AuthWrapper } from './components/AuthWrapper';
import { LanguageProvider } from './context/LanguageContext';
import { createClient } from '@/app/utils/supabase/client';
import { RubeGraphic } from '@/app/components/RubeGraphic';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function HomeContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('chat');
  const supabase = createClient();

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['chat', 'apps', 'recipes', 'use-rube', 'library'].includes(tab)) {
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
      case 'library':
        return <LibraryPage />;
      default:
        return <ChatPage />;
    }
  };

  return (
    <LanguageProvider>
      <AuthWrapper>
        {(user, loading) => {
          // Show loading spinner while checking auth
          if (loading) {
            return (
              <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fcfaf9' }}>
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
              </div>
            );
          }

          // Show login page if not authenticated
          if (!user) {
            return (
              <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-6">
                <div className="w-full max-w-md space-y-8">
                  {/* Logo */}
                  <div className="text-center">
                    <div className="flex justify-center mb-8">
                      <RubeGraphic className="h-20 w-20 text-gray-800" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Sign in to Rube by Composio
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                      Create an account or sign in to continue
                    </p>
                  </div>

                  {/* Auth UI */}
                  <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                    <Auth
                      supabaseClient={supabase}
                      appearance={{
                        theme: ThemeSupa,
                        variables: {
                          default: {
                            colors: {
                              brand: '#000000',
                              brandAccent: '#333333',
                            },
                          },
                        },
                      }}
                      providers={['google', 'github', 'slack']}
                      redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
                    />
                  </div>

                  <p className="text-center text-xs text-gray-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            );
          }

          // Show main app if authenticated
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
