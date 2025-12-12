import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

// Helper to verify admin status
async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { isAdmin: false, error: 'Not authenticated' };
    }

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) {
        return { isAdmin: false, error: 'Not authorized' };
    }

    return { isAdmin: true, userId: user.id };
}

// GET all users (admin only)
export async function GET() {
    const { isAdmin, error } = await verifyAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error }, { status: 403 });
    }

    const adminSupabase = createAdminClient();

    // Get all profiles with user data
    const { data: profiles, error: profilesError } = await adminSupabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (profilesError) {
        return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    // Get auth user data for ban status
    const { data: { users: authUsers }, error: authError } = await adminSupabase.auth.admin.listUsers();

    if (authError) {
        console.error('Failed to fetch auth users:', authError);
    }

    // Merge data
    const users = profiles.map(profile => {
        const authUser = authUsers?.find(u => u.id === profile.id) as any;
        return {
            ...profile,
            email_confirmed: authUser?.email_confirmed_at ? true : false,
            phone: authUser?.phone || null,
            phone_confirmed: authUser?.phone_confirmed_at ? true : false,
            banned_until: authUser?.banned_until || null,
            last_sign_in_at: authUser?.last_sign_in_at || null,
            created_at_auth: authUser?.created_at || profile.created_at
        };
    });

    return NextResponse.json({ users });
}

// POST - Admin actions (ban, unban, update plan, delete)
export async function POST(request: NextRequest) {
    const { isAdmin, error } = await verifyAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error }, { status: 403 });
    }

    const body = await request.json();
    const { action, userId, ...params } = body;

    const adminSupabase = createAdminClient();

    switch (action) {
        case 'ban': {
            const duration = params.duration || '876000h'; // Default 100 years
            const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
                ban_duration: duration
            });
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ success: true, message: 'User banned' });
        }

        case 'unban': {
            const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
                ban_duration: 'none'
            });
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ success: true, message: 'User unbanned' });
        }

        case 'update_plan': {
            const { plan_tier } = params;
            const { error } = await adminSupabase
                .from('profiles')
                .update({ plan_tier, subscription_status: 'active' })
                .eq('id', userId);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ success: true, message: 'Plan updated' });
        }

        case 'toggle_admin': {
            const { is_admin } = params;
            const { error } = await adminSupabase
                .from('profiles')
                .update({ is_admin })
                .eq('id', userId);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ success: true, message: is_admin ? 'Admin granted' : 'Admin revoked' });
        }

        case 'delete': {
            // Delete from auth (will cascade to profiles if FK set)
            const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId);
            if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

            // Also delete from profiles just in case
            await adminSupabase.from('profiles').delete().eq('id', userId);

            return NextResponse.json({ success: true, message: 'User deleted' });
        }

        default:
            return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
}
