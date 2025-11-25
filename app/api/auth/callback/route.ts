import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth callback route that closes the popup after successful authentication
 */
export async function GET(request: NextRequest) {
    // Get the connection status from query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const error = searchParams.get('error');

    // Return HTML that closes the popup window
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Authentication ${status === 'success' ? 'Successful' : 'Failed'}</title>
        </head>
        <body>
            <script>
                // Send message to parent window
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'OAUTH_CALLBACK',
                        status: '${status || 'unknown'}',
                        error: '${error || ''}'
                    }, '*');
                }
                
                // Close the popup
                window.close();
                
                // Fallback message if window doesn't close
                setTimeout(() => {
                    document.body.innerHTML = '<h1>Authentication complete!</h1><p>You can close this window now.</p>';
                }, 1000);
            </script>
            <h1>Processing...</h1>
        </body>
        </html>
    `;

    return new NextResponse(html, {
        headers: {
            'Content-Type': 'text/html',
        },
    });
}
