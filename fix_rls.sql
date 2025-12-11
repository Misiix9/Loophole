--Fix Infinite Recursion in RLS

--1. Create a secure function to check ownership without triggering RLS recursion
--This function runs as the database owner, bypassing RLS on 'tunnels' table
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

--2. Drop the problematic recursive policy on tunnel_shares
drop policy if exists "Owners can manage shares" on tunnel_shares;

--3. Re - create it using the secure function
    create policy "Owners can manage shares"
on tunnel_shares for all
using(
        public.check_tunnel_ownership(tunnel_id)
    );

    --4. Cleanup debug policies if they exist
drop policy if exists "Allow all users to view all tunnels" on tunnels;
drop policy if exists "Debug Allow All" on tunnels;

--5. IMPORTANT: Re - enable RLS on tunnels(in case it was disabled for debugging)
alter table tunnels enable row level security;
