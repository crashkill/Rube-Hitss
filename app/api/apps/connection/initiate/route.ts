import { NextRequest, NextResponse } from 'next/server';

/**
 * API to initiate connection with an app using Composio
 * Returns a redirect URL for OAuth or connection parameters
 */
export async function POST(request: NextRequest) {
    try {
        const { appSlug, entityId } = await request.json();

        console.log('=== Connection Initiate Debug ===');
        console.log('Received appSlug:', appSlug);
        console.log('Received entityId:', entityId);

        if (!appSlug) {
            console.error('Missing appSlug in request');
            return NextResponse.json(
                { error: 'App slug is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.COMPOSIO_API_KEY;
        console.log('API Key present:', !!apiKey);

        if (!apiKey) {
            return NextResponse.json(
                { error: 'COMPOSIO_API_KEY not configured' },
                { status: 500 }
            );
        }

        // Use entityId from request or default to 'default'
        const entity = entityId || 'default';

        // Step 1: Get the auth config for this toolkit
        console.log(`Fetching auth config for toolkit: ${appSlug}`);
        const authConfigsResponse = await fetch(
            `https://backend.composio.dev/api/v3/auth_configs`,
            {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!authConfigsResponse.ok) {
            const errorText = await authConfigsResponse.text();
            console.error('Failed to fetch auth configs:', errorText);
            return NextResponse.json(
                { error: 'Failed to fetch auth configs', details: errorText },
                { status: authConfigsResponse.status }
            );
        }

        const authConfigsData = await authConfigsResponse.json();

        // The response is an object with an 'items' property containing the array
        const authConfigs = authConfigsData.items || authConfigsData;
        console.log(`Found ${Array.isArray(authConfigs) ? authConfigs.length : 'non-array'} auth configs`);

        if (!Array.isArray(authConfigs)) {
            console.error('Auth configs is not an array:', authConfigs);
            return NextResponse.json(
                { error: 'Invalid auth configs response format' },
                { status: 500 }
            );
        }

        // Find the auth config for this toolkit (app)
        const authConfig = authConfigs.find((config: any) =>
            config.toolkit?.slug?.toLowerCase() === appSlug.toLowerCase()
        );

        if (!authConfig) {
            console.error(`No auth config found for toolkit: ${appSlug}`);
            return NextResponse.json(
                {
                    error: 'No auth config found for this app',
                    details: `Please create an auth config for ${appSlug} in your Composio dashboard first.`
                },
                { status: 404 }
            );
        }

        console.log('Found auth config:', {
            id: authConfig.id,
            toolkit: authConfig.toolkit,
            name: authConfig.name
        });

        // Step 2: Initiate connection with the auth config ID
        const initiateBody = {
            auth_config: {
                id: authConfig.id
            },
            connection: {
                entityId: entity
            }
        };

        console.log('Initiating connection with:', JSON.stringify(initiateBody, null, 2));

        const response = await fetch(
            `https://backend.composio.dev/api/v3/connected_accounts`,
            {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(initiateBody),
            }
        );

        console.log('Composio response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Composio API error:', errorText);

            return NextResponse.json(
                { error: 'Failed to initiate connection', details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('Composio response data:', JSON.stringify(data, null, 2));

        // Return the connection data
        // For OAuth apps, this will include redirect_url
        return NextResponse.json({
            success: true,
            connectionStatus: data.connectionStatus,
            redirectUrl: data.redirectUrl || data.redirect_url,
            connectedAccountId: data.id,
            requiresRedirect: !!(data.redirectUrl || data.redirect_url),
        });
    } catch (error) {
        console.error('Error initiating connection:', error);
        return NextResponse.json(
            { error: 'Failed to initiate connection', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
