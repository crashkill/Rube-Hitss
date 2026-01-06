import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { getComposio } from '../../../utils/composio';

/**
 * Debug API to check connection status and entity matching
 */
export async function GET(request: NextRequest) {
    try {
        // Get authenticated user
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user || !user.email) {
            return NextResponse.json(
                { error: 'Unauthorized - Please sign in' },
                { status: 401 }
            );
        }

        const composio = getComposio();
        const userEmail = user.email;

        console.log('=== DEBUG CONNECTION CHECK ===');
        console.log('User email (entityId):', userEmail);

        // Method 1: List by userIds (email)
        const byEmail = await composio.connectedAccounts.list({
            userIds: [userEmail]
        });

        console.log('Connections found by email:', byEmail.items?.length || 0);

        // Method 2: List all and filter
        const allAccounts = await composio.connectedAccounts.list({});
        console.log('Total connections in project:', allAccounts.items?.length || 0);

        // Check if any Gmail connection exists
        const gmailConnections = allAccounts.items?.filter(
            acc => acc.toolkit?.slug?.toLowerCase().includes('gmail')
        ) || [];

        console.log('Gmail connections found:', gmailConnections.length);

        // Log details of each Gmail connection
        const gmailDetails = await Promise.all(
            gmailConnections.map(async (conn) => {
                try {
                    const details = await composio.connectedAccounts.get(conn.id);

                    // Log FULL object to debug "UserId N/A" mystery
                    console.log(`FULL ACCOUNT DETAILS for ${conn.id}:`, JSON.stringify(details, null, 2));

                    // Log essential info
                    console.log('Account details for', conn.id, ':', {
                        toolkit: details.toolkit?.slug,
                        connectionId: details.id,
                        authConfigId: details.authConfig?.id,
                        status: details.status,
                        // Try different fields for user ID
                        entityId: (details as any).entityId,
                        userId: (details as any).userId,
                        user_id: (details as any).user_id,
                        entity_id: (details as any).entity_id,
                        entity: (details as any).entity
                    });

                    return {
                        id: details.id,
                        toolkit: details.toolkit?.slug,
                        status: details.status,
                        userId: (details as any).entity?.id || (details as any).entityId || 'N/A',
                        createdAt: details.createdAt
                    };
                } catch (e) {
                    console.error('Error fetching details for', conn.id, e);
                    return { id: conn.id, error: 'Failed to fetch details' };
                }
            })
        );

        console.log('Gmail connection details:', JSON.stringify(gmailDetails, null, 2));
        console.log('=== END DEBUG ===');

        return NextResponse.json({
            debug: true,
            currentUserEmail: userEmail,
            connectionsByEmail: byEmail.items?.length || 0,
            totalConnectionsInProject: allAccounts.items?.length || 0,
            gmailConnectionsFound: gmailConnections.length,
            gmailDetails,
            recommendation: gmailDetails.length > 0 && gmailDetails.some((g: any) => g.userId !== userEmail)
                ? 'MISMATCH DETECTED: Gmail connection exists but with different userId. Reconnect using the current email.'
                : gmailDetails.length === 0
                    ? 'No Gmail connections found. Connect Gmail first.'
                    : 'Gmail connected for current user.'
        });

    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json(
            { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
