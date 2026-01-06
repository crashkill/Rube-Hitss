import { NextRequest, NextResponse } from 'next/server';
import { getComposio } from '../../../../utils/composio';

/**
 * API to wait for a connection to become ACTIVE
 * Polls the connection status until it becomes ACTIVE, FAILED, or times out
 */
export async function POST(request: NextRequest) {
    try {
        const { connectionId } = await request.json();

        if (!connectionId) {
            return NextResponse.json(
                { error: 'connectionId is required' },
                { status: 400 }
            );
        }

        console.log(`[waitForConnection] Waiting for connection ${connectionId} to become ACTIVE...`);

        const composio = getComposio();

        // Wait for connection to become active (max 60 seconds, check every 2 seconds)
        const maxAttempts = 30;
        const delayMs = 2000;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const connection = await composio.connectedAccounts.get(connectionId);

                console.log(`[waitForConnection] Attempt ${attempt}/${maxAttempts}: Status = ${connection.status}`);

                if (connection.status === 'ACTIVE') {
                    console.log(`[waitForConnection] ✅ Connection ${connectionId} is now ACTIVE!`);
                    return NextResponse.json({
                        success: true,
                        status: 'ACTIVE',
                        connection: {
                            id: connection.id,
                            appName: connection.toolkit?.slug,
                            status: connection.status
                        }
                    });
                }

                if (connection.status === 'FAILED' || connection.status === 'EXPIRED') {
                    console.log(`[waitForConnection] ❌ Connection ${connectionId} failed with status: ${connection.status}`);
                    return NextResponse.json({
                        success: false,
                        status: connection.status,
                        error: 'Connection failed or expired'
                    });
                }

                // Still INITIATED or PENDING, wait and try again
                if (attempt < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            } catch (error) {
                console.error(`[waitForConnection] Error checking connection status:`, error);
                // Continue polling even if there's an error
                if (attempt < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }
        }

        // Timeout
        console.log(`[waitForConnection] ⏱️ Timeout waiting for connection ${connectionId}`);
        return NextResponse.json({
            success: false,
            status: 'TIMEOUT',
            error: 'Connection did not become ACTIVE within timeout period',
            message: 'The connection may still complete. Please refresh to check the status.'
        });

    } catch (error) {
        console.error('[waitForConnection] Error:', error);
        return NextResponse.json(
            { error: 'Failed to wait for connection', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
