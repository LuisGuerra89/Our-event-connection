-- Add column to track if user has completed their profile
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email'; -- 'email', 'google', 'facebook', etc.

-- Mark existing profiles as complete (they registered the normal way)
UPDATE profiles 
SET is_profile_complete = TRUE
WHERE is_profile_complete IS NULL OR is_profile_complete = FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_profile_complete ON profiles(is_profile_complete);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider ON profiles(auth_provider);
