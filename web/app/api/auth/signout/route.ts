import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const supabase = await createClient();
        await supabase.auth.signOut();
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Sign out error:', err);
        return NextResponse.json({ success: false, error: 'Sign out failed' }, { status: 500 });
    }
}
