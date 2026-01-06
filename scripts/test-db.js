const { createClient } = require('@supabase/supabase-js');

// Config do Supabase Imperial
const supabaseUrl = 'https://supabase.fsw-hitss.duckdns.org';
const supabaseKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTUzNjMwMCwiZXhwIjo0OTIxMjA5OTAwLCJyb2xlIjoiYW5vbiJ9.ztjFoaCuSo_SK22bsKrsf6T_Nu-l4cAPKibNLOQgg8g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('🛰️ Testing Supabase Imperial Connection...');
    console.log('URL:', supabaseUrl);

    try {
        // Tenta buscar recipes (tabela pública)
        console.log('📋 Querying recipes table...');
        const { data, error } = await supabase
            .from('recipes')
            .select('id, title')
            .eq('is_active', true)
            .limit(3);

        if (error) {
            console.error('❌ Connection Failed:', error);
            if (error.cause) console.error('Cause:', error.cause);
        } else {
            console.log('✅ Connection Successful!');
            console.log('Recipes found:', data.length);
            console.log('Data:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('🔥 Unexpected Error:', err);
    }
}

test();
