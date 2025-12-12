import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export interface UserData {
    id: string;
    email: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    plan_tier: 'hobby' | 'creator' | 'startup';
    subscription_status?: string;
    stripe_subscription_id?: string | null;
    is_admin?: boolean;
}

export async function GET() {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ user: null });
        }

        // Fetch profile from database using ADMIN client to bypass RLS
        const adminSupabase = createAdminClient();
        const { data: profile, error: profileError } = await adminSupabase
            .from('profiles')
            .select('username, display_name, avatar_url, plan_tier, subscription_status, stripe_subscription_id, is_admin')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
            // Return user data from auth metadata if profile fetch fails
            return NextResponse.json({
                user: {
                    id: user.id,
                    email: user.email || '',
                    username: user.user_metadata?.username || null,
                    display_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                    avatar_url: user.user_metadata?.avatar_url || null,
                    plan_tier: 'hobby' as const,
                    subscription_status: 'active',
                    is_admin: false
                }
            });
        }

        // Return combined user data
        const userData: UserData = {
            id: user.id,
            email: user.email || '',
            username: profile.username,
            display_name: profile.display_name || user.user_metadata?.full_name || null,
            avatar_url: profile.avatar_url || user.user_metadata?.avatar_url || null,
            plan_tier: profile.plan_tier || 'hobby',
            subscription_status: profile.subscription_status,
            stripe_subscription_id: profile.stripe_subscription_id,
            is_admin: profile.is_admin || false
        };

        return NextResponse.json({ user: userData });
    } catch (err) {
        console.error('Auth API error:', err);
        return NextResponse.json({ user: null, error: 'Failed to fetch user' });
    }
}
