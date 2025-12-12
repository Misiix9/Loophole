import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ profile: null });
        }

        // Fetch profile from database
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, plan_tier, has_selected_plan, subscription_status')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
            return NextResponse.json({ profile: null, error: profileError.message });
        }

        return NextResponse.json({ profile });
    } catch (err) {
        console.error('Profile API error:', err);
        return NextResponse.json({ profile: null, error: 'Failed to fetch profile' });
    }
}
