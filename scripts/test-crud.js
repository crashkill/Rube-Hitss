require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Config do Supabase Imperial
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCrud() {
    console.log('🧪 Testing Recipes CRUD Operations...');

    let newRecipeId = null;

    // 1. CREATE (Insert directly to verify DB access first)
    console.log('\n1️⃣  Testing CREATE (via DB direct mode for now)...');
    try {
        const { data, error } = await supabase
            .from('recipes')
            .insert([{
                title: 'Test Recipe Auto',
                description: 'Created by automated test script',
                category: 'Testing',
                apps: [{ name: 'TestApp', icon: 'test', color: '#000000' }],
                prompt_template: 'This is a test prompt',
                is_active: true
            }])
            .select()
            .single();

        if (error) throw error;
        console.log('✅ Created:', data.title, `(ID: ${data.id})`);
        newRecipeId = data.id;
    } catch (err) {
        console.error('❌ Create Failed:', err.message);
        return;
    }

    // 2. READ (via API simulation)
    console.log('\n2️⃣  Testing READ...');
    try {
        const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .eq('id', newRecipeId)
            .single();

        if (error) throw error;
        if (data.title === 'Test Recipe Auto') {
            console.log('✅ Read Successful:', data.title);
        } else {
            console.error('❌ Read Mismatch:', data);
        }
    } catch (err) {
        console.error('❌ Read Failed:', err.message);
    }

    // 3. UPDATE
    console.log('\n3️⃣  Testing UPDATE...');
    try {
        const { data, error } = await supabase
            .from('recipes')
            .update({ title: 'Test Recipe UPDATED' })
            .eq('id', newRecipeId)
            .select()
            .single();

        if (error) throw error;
        if (data.title === 'Test Recipe UPDATED') {
            console.log('✅ Update Successful:', data.title);
        } else {
            console.error('❌ Update Failed');
        }
    } catch (err) {
        console.error('❌ Update Failed:', err.message);
    }

    // 4. DELETE
    console.log('\n4️⃣  Testing DELETE...');
    try {
        const { error } = await supabase
            .from('recipes')
            .delete()
            .eq('id', newRecipeId);

        if (error) throw error;

        // Verify deletion
        const { data } = await supabase.from('recipes').select('*').eq('id', newRecipeId);
        if (data.length === 0) {
            console.log('✅ Delete Successful');
        } else {
            console.error('❌ Delete Failed: Item still exists');
        }
    } catch (err) {
        console.error('❌ Delete Failed:', err.message);
    }
}

testCrud();
