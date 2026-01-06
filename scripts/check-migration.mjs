/**
 * Script de Diagnóstico Imperial - Verificar Migração Supabase
 * Verifica se as tabelas foram criadas no Supabase Imperial
 */

import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase Imperial
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.fsw-hitss.duckdns.org';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTMxMjYyMCwiZXhwIjo0OTIwOTg2MjIwLCJyb2xlIjoiYW5vbiJ9.ROa02tImzr0KYvitB18aq3cmYEvn_v77nhYmhfL6kVc';

console.log('==========================================');
console.log('🛰️ DIAGNÓSTICO IMPERIAL - SUPABASE');
console.log('==========================================');
console.log('URL:', SUPABASE_URL);
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTables() {
    const tables = ['conversations', 'messages', 'recipes', 'user_recipes'];
    const results = {};

    for (const table of tables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                results[table] = { exists: false, error: error.message };
            } else {
                results[table] = { exists: true, count: count || 0 };
            }
        } catch (e) {
            results[table] = { exists: false, error: e.message };
        }
    }

    return results;
}

async function checkRecipes() {
    const { data, error } = await supabase
        .from('recipes')
        .select('id, title, category')
        .limit(10);

    if (error) {
        return { error: error.message };
    }

    return { recipes: data };
}

async function main() {
    console.log('📊 Verificando tabelas...');
    console.log('');

    const tableResults = await checkTables();

    console.log('RESULTADO DA VERIFICAÇÃO:');
    console.log('==========================================');

    for (const [table, result] of Object.entries(tableResults)) {
        if (result.exists) {
            console.log(`✅ ${table}: Existe (${result.count} registros)`);
        } else {
            console.log(`❌ ${table}: ${result.error}`);
        }
    }

    console.log('');
    console.log('📋 Verificando dados de Recipes...');
    const recipesResult = await checkRecipes();

    if (recipesResult.error) {
        console.log('❌ Erro ao buscar recipes:', recipesResult.error);
    } else if (recipesResult.recipes?.length > 0) {
        console.log('✅ Recipes encontradas:');
        recipesResult.recipes.forEach((r, i) => {
            console.log(`   ${i + 1}. ${r.title} (${r.category})`);
        });
    } else {
        console.log('⚠️  Nenhuma recipe encontrada. Execute o script migrate-to-imperial.sql');
    }

    console.log('');
    console.log('==========================================');
    console.log('🏁 Diagnóstico concluído!');
    console.log('==========================================');
}

main().catch(console.error);
