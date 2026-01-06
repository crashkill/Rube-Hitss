import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const cwd = process.cwd();
        const logPath = path.join(cwd, 'test_log.txt');
        const message = `Test log entry at ${new Date().toISOString()}\n`;

        fs.appendFileSync(logPath, message);

        return NextResponse.json({
            success: true,
            cwd,
            logPath,
            message: 'Log file written successfully'
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
