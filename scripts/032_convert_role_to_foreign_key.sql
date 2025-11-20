-- Migration: Convert role field from text to foreign key reference
-- This script safely migrates the profiles.role field to reference the roles table

-- Step 1: Insert default roles if they don't exist
INSERT INTO roles (role_name, description, status)
VALUES 
  ('user', 'Regular platform user', 'active'),
  ('admin', 'Administrator with full access', 'active'),
  ('moderator', 'Moderator with limited admin access', 'active')
ON CONFLICT (role_name) DO NOTHING;

-- Step 2: Add new role_id column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);

-- Step 3: Create a temporary mapping between role names and role IDs
DO $$
DECLARE
  user_role_id UUID;
  admin_role_id UUID;
  moderator_role_id UUID;
BEGIN
  -- Get role IDs
  SELECT id INTO user_role_id FROM roles WHERE role_name = 'user';
  SELECT id INTO admin_role_id FROM roles WHERE role_name = 'admin';
  SELECT id INTO moderator_role_id FROM roles WHERE role_name = 'moderator';

  -- Update existing profiles to use role_id instead of role text
  UPDATE profiles SET role_id = user_role_id WHERE role = 'user' OR role IS NULL;
  UPDATE profiles SET role_id = admin_role_id WHERE role = 'admin';
  UPDATE profiles SET role_id = moderator_role_id WHERE role = 'moderator';
END $$;

-- Step 4: Set default role for profiles without a role
UPDATE profiles 
SET role_id = (SELECT id FROM roles WHERE role_name = 'user')
WHERE role_id IS NULL;

-- Step 5: Make role_id NOT NULL (default will be handled by trigger)
ALTER TABLE profiles ALTER COLUMN role_id SET NOT NULL;

-- Removed SET DEFAULT with subquery - default is now handled in handle_new_user trigger

-- Step 6: Drop the old role text column (after verifying migration)
-- Commented out for safety - uncomment after verifying the migration works
-- ALTER TABLE profiles DROP COLUMN IF EXISTS role;

-- Step 7: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);

-- Step 8: Create a view for easier querying
CREATE OR REPLACE VIEW profiles_with_roles AS
SELECT 
  p.*,
  r.role_name,
  r.description as role_description,
  r.status as role_status
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id;

-- Step 9: Update the handle_new_user function to use role_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
SET search_path = public
AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Get the default 'user' role ID
  SELECT id INTO default_role_id FROM roles WHERE role_name = 'user' LIMIT 1;
  
  -- Insert profile with role_id
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    role_id,
    referral_code
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', NULL),
    default_role_id,
    UPPER(SUBSTRING(MD5(RANDOM()::TEXT || new.id::TEXT) FROM 1 FOR 8))
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    role_id = COALESCE(profiles.role_id, default_role_id);
  
  RETURN new;
END;
$$;

-- Verification query (uncomment to check results)
-- SELECT p.id, p.email, p.full_name, p.role as old_role, r.role_name as new_role
-- FROM profiles p
-- LEFT JOIN roles r ON p.role_id = r.id;
