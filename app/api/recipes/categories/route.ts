import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// GET /api/recipes/categories - Get all unique categories
export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('recipes')
            .select('category')
            .eq('is_active', true);

        if (error) {
            console.error('Error fetching categories:', error);
            return NextResponse.json(
                { error: 'Failed to fetch categories', details: error.message },
                { status: 500 }
            );
        }

        // Extract unique categories
        const categories = [...new Set(data?.map(r => r.category) || [])];

        return NextResponse.json({ categories });
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
