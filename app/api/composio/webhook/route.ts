import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export const runtime = 'nodejs'

function extractSignature(headers: Headers) {
  const raw =
    headers.get('x-composio-signature') ||
    headers.get('x-signature') ||
    headers.get('x-hub-signature-256') ||
    headers.get('x-signature-sha256') ||
    ''
  const match = raw.match(/signature=([^,]+)/i)
  const value = match ? match[1] : raw
  return value.startsWith('sha256=') ? value.slice(7) : value
}

function verifySignature(rawBody: string, headers: Headers, secret: string) {
  const sig = extractSignature(headers)
  if (!sig || !secret) return false

  const hHex = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
  const hBase64 = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64')

  const a = Buffer.from(sig)
  const bHex = Buffer.from(hHex)
  const bBase64 = Buffer.from(hBase64)

  if (a.length === bHex.length && crypto.timingSafeEqual(a, bHex)) return true
  if (a.length === bBase64.length && crypto.timingSafeEqual(a, bBase64)) return true
  return false
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.COMPOSIO_WEBHOOK_SECRET || ''
    const raw = await request.text()
    const ok = secret && verifySignature(raw, request.headers, secret)
    if (!ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

    let payload: unknown = null
    try {
      payload = JSON.parse(raw)
    } catch {}

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}