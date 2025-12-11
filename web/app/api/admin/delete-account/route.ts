import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client to delete user
    const adminClient = createAdminClient();
    
    // First delete all user's data
    // Delete user's tunnels
    await adminClient.from('tunnels').delete().eq('user_id', user.id);
    
    // Delete user's team memberships
    await adminClient.from('team_members').delete().eq('user_id', user.id);
    
    // Delete teams owned by user
    await adminClient.from('teams').delete().eq('owner_id', user.id);
    
    // Delete user's profile
    await adminClient.from('profiles').delete().eq('id', user.id);
    
    // Finally delete the auth user
    const { error } = await adminClient.auth.admin.deleteUser(user.id);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
