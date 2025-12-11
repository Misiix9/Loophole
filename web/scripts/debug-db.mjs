
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars', { supabaseUrl, hasKey: !!supabaseServiceKey });
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log('Checking Teams table...');
    const { data: teams, error } = await supabase.from('teams').select('*');

    if (error) {
        console.error('Error fetching teams:', error);
        return;
    }

    console.log(`Found ${teams.length} teams.`);
    console.log(JSON.stringify(teams, null, 2));

    console.log('\nChecking Team Members...');
    const { data: members, error: membersError } = await supabase.from('team_members').select('*');
    if (membersError) {
        console.error('Error fetching members:', membersError);
    } else {
        console.log(`Found ${members.length} members.`);
        console.log(JSON.stringify(members, null, 2));
    }
}

main();
