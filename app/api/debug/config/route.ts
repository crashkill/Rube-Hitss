import { NextResponse } from 'next/server';

/**
 * Debug API to check Supabase environment configuration
 */
export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET';
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return NextResponse.json({
        debug: true,
        supabaseUrl: supabaseUrl,
        hasAnonKey: hasAnonKey,
        anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...' || 'NOT SET',
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
}
