import { NextRequest, NextResponse } from 'next/server';

/**
 * API to create auth config with custom OAuth credentials
 * This is called when user submits credentials through the OAuth modal
 */
export async function POST(request: NextRequest) {
    try {
        const { toolkitSlug, clientId, clientSecret } = await request.json();

        // Validate input
        if (!toolkitSlug || !clientId || !clientSecret) {
            return NextResponse.json(
                { error: 'Toolkit slug, client ID, and client secret are required' },
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

        // Determine the redirect URI based on the toolkit
        const redirectUri = 'https://backend.composio.dev/api/v3/toolkits/auth/callback';

        // Create auth config with custom OAuth credentials
        const response = await fetch('https://backend.composio.dev/api/v1/auth_configs', {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                toolkit: toolkitSlug,
                name: `${toolkitSlug}-toolrouter-config`,
                auth_mode: 'OAUTH2',
                auth_config: {
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Composio API error:', errorText);

            // Try to parse error message
            let errorMessage = 'Failed to create auth config';
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorJson.error || errorMessage;
            } catch (e) {
                // If not JSON, use the text as is
                if (errorText) {
                    errorMessage = errorText;
                }
            }

            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            );
        }

        const authConfig = await response.json();

        return NextResponse.json({
            success: true,
            authConfigId: authConfig.id,
            toolkit: toolkitSlug,
            name: authConfig.name,
            message: 'OAuth credentials saved successfully',
        });
    } catch (error) {
        console.error('Error creating auth config with credentials:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to create auth config',
            },
            { status: 500 }
        );
    }
}
