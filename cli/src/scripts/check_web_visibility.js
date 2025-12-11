
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load WEB .env.local for Anon Key
dotenv.config({ path: path.resolve('..', 'web', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Web Visibility (Anon Key)...');
console.log('URL:', supabaseUrl);
console.log('Key (start):', supabaseAnonKey?.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('\nQuerying tunnels as Anon...');
    const { data, error } = await supabase.from('tunnels').select('*');

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`Found ${data.length} tunnels.`);
        if (data.length > 0) {
            console.log('First tunnel:', data[0]);
        } else {
            console.log('Result is empty [] (RLS is likely blocking)');
        }
    }
}

check();
