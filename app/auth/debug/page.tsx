'use client'

import { createClient } from '@/app/utils/supabase/client'
import { useState, useEffect } from 'react'

export default function DebugAuthPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [logs, setLogs] = useState<string[]>([])
    const [envCheck, setEnvCheck] = useState<any>({})

    const supabase = createClient()

    useEffect(() => {
        // Check Env Vars (Client Side)
        setEnvCheck({
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            keySuffix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(-5)
        })
    }, [])

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1]} - ${msg}`])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        addLog('Attemping login...')

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                addLog(`ERROR: ${error.message} (Status: ${error.status})`)
                console.error(error)
            } else {
                addLog(`SUCCESS: User ${data.user.id} logged in.`)
                addLog(`Session: ${data.session?.access_token.slice(0, 10)}...`)
            }
        } catch (err: any) {
            addLog(`FATAL: ${err.message}`)
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Auth Debugger</h1>

            <div className="bg-gray-100 p-4 rounded text-sm font-mono">
                <h3 className="font-bold mb-2">Environment Check:</h3>
                <p>URL: {envCheck.url || 'UNDEFINED'}</p>
                <p>Has Key: {envCheck.hasKey ? 'YES' : 'NO'}</p>
                <p>Key Suffix: {envCheck.keySuffix || 'N/A'}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 border p-4 rounded">
                <div>
                    <label className="block text-sm">Email</label>
                    <input
                        className="border p-2 w-full"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm">Password</label>
                    <input
                        type="password"
                        className="border p-2 w-full"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Test Direct Login
                </button>
            </form>

            <div className="bg-black text-green-400 p-4 rounded h-64 overflow-auto font-mono text-xs">
                {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
        </div>
    )
}
