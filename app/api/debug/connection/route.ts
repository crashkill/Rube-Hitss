import { NextRequest, NextResponse } from 'next/server';
import { getComposio } from '../../../utils/composio';

export async function GET(request: NextRequest) {
    const composio = getComposio();
    const connectionId = 'ca_-7gnNmMaWoZV'; // The most recent Gmail connection

    try {
        const account = await composio.connectedAccounts.get(connectionId);
        return NextResponse.json({
            id: account.id,
            status: account.status,
            full: account
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
