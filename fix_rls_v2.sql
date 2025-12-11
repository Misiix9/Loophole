--FIX RLS v2: Recursion + Permissions

--1. Helper function to safely check ownership(Bypasses RLS to avoid recursion)
create or replace function public.check_tunnel_ownership(tid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists(
    select 1 from tunnels
    where id = tid
    and user_id = auth.uid()
);
$$;

--2. Drop existing policies to start fresh and avoid conflicts
drop policy if exists "Owners can manage shares" on tunnel_shares;
drop policy if exists "Shared users can view their share" on tunnel_shares;
drop policy if exists "Shared users can view tunnels" on tunnels;

--3. Fix "tunnel_shares" policies
--A.Owners: Use the secure function (Fixes Recursion)
create policy "Owners can manage shares"
on tunnel_shares for all
using(
    public.check_tunnel_ownership(tunnel_id)
);

    --B.Shared Users: Use JWT email instead of querying auth.users table(Fixes Permission Error)
create policy "Shared users can view their share"
on tunnel_shares for select
using(
        shared_with_email = (select auth.jwt() ->> 'email')
);

--4. Fix "tunnels" policies
--A.Shared Users: Use JWT email here too
create policy "Shared users can view tunnels"
on tunnels for select
using(
    exists(
        select 1 from tunnel_shares
    where tunnel_shares.tunnel_id = tunnels.id
    and tunnel_shares.shared_with_email = (select auth.jwt() ->> 'email')
)
);

--5. Ensure "My Tunnels" policy exists(Standard Owner Visibility)
drop policy if exists "Users can view own tunnels" on tunnels;
create policy "Users can view own tunnels"
on tunnels for select
using(
    auth.uid() = user_id
);

    --6. Enable RLS
alter table tunnels enable row level security;
alter table tunnel_shares enable row level security;
