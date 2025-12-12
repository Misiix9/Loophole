-- ==========================================
    --LOOPHOLE - DATABASE SETUP(Production Ready)
--Run this in Supabase SQL Editor
-- ==========================================

    --1. Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--2. Drop all existing policies first
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Enable insert for users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

--3. Create fresh policies
CREATE POLICY "Enable read access for all users" ON profiles
  FOR SELECT USING(true);

CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT WITH CHECK(auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON profiles
  FOR UPDATE USING(auth.uid() = id);

--4. Ensure the profiles table has all needed columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

--5. ADD SUBSCRIPTION COLUMNS(Production Ready)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'hobby';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_selected_plan BOOLEAN DEFAULT FALSE;

--6. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_plan_tier ON profiles(plan_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

--7. Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;

-- ==========================================
    --STORAGE BUCKET FOR AVATARS
--Go to Supabase Dashboard > Storage > New Bucket
--Name: avatars
--Public: YES
-- ==========================================

    -- ==========================================
    --BACKFILL: Set all existing users to hobby plan
-- ==========================================
    UPDATE public.profiles 
SET plan_tier = 'hobby' 
WHERE plan_tier IS NULL;
