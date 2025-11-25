import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { toolkitSlug } = await request.json();

        if (!toolkitSlug) {
            return NextResponse.json(
                { error: 'Toolkit slug is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.COMPOSIO_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'COMPOSIO_API_KEY not configured' },
                { status: 500 }
            );
        }

        // Create auth config via Composio API
        const response = await fetch('https://backend.composio.dev/api/v1/auth_configs', {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                toolkit: toolkitSlug,
                name: `${toolkitSlug}-toolrouter-config`,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Composio API error:', error);
            return NextResponse.json(
                { error: 'Failed to create auth config' },
                { status: response.status }
            );
        }

        const authConfig = await response.json();

        return NextResponse.json({
            authConfigId: authConfig.id,
            toolkit: toolkitSlug
        });
    } catch (error) {
        console.error('Error creating auth config:', error);
        return NextResponse.json(
            { error: 'Failed to create auth config' },
            { status: 500 }
        );
    }
}
