import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const supabase = await createClient();

        // Sign out the user
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Sign out error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Sign out failed:', err);
        return NextResponse.json({ error: 'Sign out failed' }, { status: 500 });
    }
}
