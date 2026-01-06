import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

interface Params {
    params: Promise<{ id: string }>;
}

// GET /api/recipes/[id] - Get a specific recipe
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .eq('id', id)
            .eq('is_active', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Recipe not found' },
                    { status: 404 }
                );
            }
            console.error('Error fetching recipe:', error);
            return NextResponse.json(
                { error: 'Failed to fetch recipe', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ recipe: data });
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/recipes/[id] - Update a recipe (admin only - future)
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, description, apps, category, prompt_template, is_featured, is_active } = body;

        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (apps !== undefined) updates.apps = apps;
        if (category !== undefined) updates.category = category;
        if (prompt_template !== undefined) updates.prompt_template = prompt_template;
        if (is_featured !== undefined) updates.is_featured = is_featured;
        if (is_active !== undefined) updates.is_active = is_active;

        const { data, error } = await supabase
            .from('recipes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating recipe:', error);
            return NextResponse.json(
                { error: 'Failed to update recipe', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ recipe: data });
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/recipes/[id] - Soft delete a recipe (admin only - future)
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Soft delete by setting is_active to false
        const { error } = await supabase
            .from('recipes')
            .update({ is_active: false })
            .eq('id', id);

        if (error) {
            console.error('Error deleting recipe:', error);
            return NextResponse.json(
                { error: 'Failed to delete recipe', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
