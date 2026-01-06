// Script para criar usuário no Supabase
// Execute: node scripts/create-user.mjs

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://supabase.fsw-hitss.duckdns.org'
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTMxMjYyMCwiZXhwIjo0OTIwOTg2MjIwLCJyb2xlIjoiYW5vbiJ9.ROa02tImzr0KYvitB18aq3cmYEvn_v77nhYmhfL6kVc'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createUser() {
    console.log('🚀 Criando usuário no Supabase...')
    console.log('URL:', supabaseUrl)

    const { data, error } = await supabase.auth.signUp({
        email: 'fabricio.lima@rube.local',
        password: '123456',
        options: {
            data: {
                full_name: 'Fabricio Lima'
            }
        }
    })

    if (error) {
        console.error('❌ Erro ao criar usuário:', error.message)
        return
    }

    console.log('✅ Usuário criado com sucesso!')
    console.log('📧 Email:', data.user?.email)
    console.log('🆔 ID:', data.user?.id)
    console.log('')
    console.log('Credenciais para login:')
    console.log('  Email: fabricio.lima@rube.local')
    console.log('  Senha: 123456')
}

createUser()
