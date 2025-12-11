--1. Modify existing profiles table to add 'username' if missing
alter table public.profiles 
add column if not exists username text unique;

--2. Enable RLS(just in case)
alter table public.profiles enable row level security;

--3. Update Policy to allow users to update their own profile(including username)
drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile."
  on profiles for update
  using(auth.uid() = id);

    drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using(true);

    --4. Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles(id, email, display_name, avatar_url, username)
values(
    new.id,
    new.email, --Sync email as well since your table has it
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), --Map to display_name
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'username'
)
  on conflict(id) do update set
    email = excluded.email,
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    username = excluded.username;

return new;
end;
$$;

--5. Trigger to call the function on insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
for each row execute procedure public.handle_new_user();

--6. STORAGE BUCKET FOR AVATARS
--Run this in the Supabase Dashboard > Storage > Create bucket
--Bucket name: avatars
--Public bucket: YES(enable public access)
-- 
--Or run this SQL if you have storage admin access:
--insert into storage.buckets(id, name, public)
--values('avatars', 'avatars', true);

--Storage policy for authenticated uploads
--Go to Storage > Policies and add:
--Policy name: "Users can upload avatars"
--Allowed operation: INSERT
--Policy definition: (bucket_id = 'avatars') AND(auth.uid() IS NOT NULL)

--Policy name: "Public avatar access"
--Allowed operation: SELECT
--Policy definition: (bucket_id = 'avatars')
