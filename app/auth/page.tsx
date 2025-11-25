'use client'

import { createClient } from '@/app/utils/supabase/client'
import { RubeGraphic } from '@/app/components/RubeGraphic'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default function AuthPage() {
  const supabase = createClient()

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
            providers={['google']}
            redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
          />
        </div>

        <p className="text-center text-xs text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}