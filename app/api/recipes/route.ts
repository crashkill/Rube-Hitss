import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export interface Recipe {
    id: string;
    title: string;
    description: string;
    apps: { name: string; icon: string; color: string }[];
    category: string;
    prompt_template: string;
    is_featured: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// GET /api/recipes - List all active recipes
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');

        const supabase = await createClient();

        let query = supabase
            .from('recipes')
            .select('*')
            .eq('is_active', true)
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching recipes:', error);
            return NextResponse.json(
                { error: 'Failed to fetch recipes', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ recipes: data || [] });
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/recipes - Create a new recipe (admin only - future)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, description, apps, category, prompt_template } = body;

        if (!title || !description || !apps || !category || !prompt_template) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('recipes')
            .insert([{
                title,
                description,
                apps,
                category,
                prompt_template,
                is_active: true,
                is_featured: false
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating recipe:', error);
            return NextResponse.json(
                { error: 'Failed to create recipe', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ recipe: data }, { status: 201 });
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
