-- ========================================================
-- PROFILE IMAGE SUPPORT - COMPLETE SETUP
-- ========================================================
-- Execute this entire script in Supabase SQL Editor
-- This sets up database and storage for profile images

-- ========================================================
-- STEP 1: Add profile_image_url column to profiles table
-- ========================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_profile_image_url ON public.profiles(profile_image_url);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.profile_image_url IS 'URL to user profile image stored in Supabase Storage (profiles bucket)';


-- ========================================================
-- STEP 2: CREATE STORAGE BUCKET
-- ========================================================
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;


-- ========================================================
-- STEP 3: CREATE RLS POLICIES FOR STORAGE
-- ========================================================

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Allow public read profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users delete own profile images" ON storage.objects;

-- Policy 1: Allow public to view all profile images
CREATE POLICY "Allow public read profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- Policy 2: Allow authenticated users to upload images
CREATE POLICY "Allow authenticated upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profiles'
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to update their own images
CREATE POLICY "Allow authenticated users to update their own profile images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profiles' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

-- Policy 4: Allow authenticated users to delete their own images
CREATE POLICY "Allow users delete own profile images"
ON storage.objects FOR DELETE
USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');


-- ========================================================
-- VERIFICATION
-- ========================================================
-- Verify database column was created
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'profile_image_url';

-- Verify bucket was created
SELECT id, name, public FROM storage.buckets WHERE id = 'profiles';

-- Verify RLS policies were created
SELECT policyname
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
