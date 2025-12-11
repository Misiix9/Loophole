
import { supabase } from '../utils/db.js';
import { getConfig } from '../utils/config.js';
import chalk from 'chalk';

async function check() {
    console.log('Checking database content...');

    if (!supabase) {
        console.error('Supabase client not initialized (missing .env?)');
        return;
    }

    const config = getConfig();
    const userId = config.userId;

    console.log(`Target User ID: ${userId}`);

    // Check Tunnels
    const { data: tunnels, error } = await supabase
        .from('tunnels')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching tunnels:', error);
    } else {
        console.log(`Found ${tunnels.length} tunnels for this user.`);
        tunnels.forEach(t => {
            console.log(`- [${t.status}] ${t.project_name} (${t.current_url}) ID: ${t.id}`);
        });
    }

    // Check Auth User existence (trickier with service role, but we can try generic user list if allowed, or just trust FK)
    // Actually, we can't easily query auth.users directly via client usually, but service role key might allow admin api. 
    // Let's stick to public schema first.

    // Check if any tunnels exist at all
    const { count } = await supabase.from('tunnels').select('*', { count: 'exact', head: true });
    console.log(`Total tunnels in DB (any user): ${count}`);
}

check();
