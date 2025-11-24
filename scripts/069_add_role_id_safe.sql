-- Safe migration: Add role_id column to profiles table
-- This is a simplified version of 032 that only adds the role_id column
-- without modifying existing views or triggers

-- Step 1: Ensure roles exist
INSERT INTO roles (role_name, description, status)
VALUES 
  ('user', 'Regular platform user', 'active'),
  ('admin', 'Administrator with full access', 'active'),
  ('moderator', 'Moderator with limited admin access', 'active')
ON CONFLICT (role_name) DO NOTHING;

-- Step 2: Add role_id column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_id UUID;

-- Step 3: Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_role_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_role_id_fkey
      FOREIGN KEY (role_id) REFERENCES roles(id);
  END IF;
END $$;

-- Step 4: Migrate existing data from role (text) to role_id (uuid)
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

  -- Update existing profiles to use role_id
  -- Only update if role_id is NULL (to avoid overwriting existing data)
  UPDATE profiles 
  SET role_id = user_role_id 
  WHERE (role = 'user' OR role IS NULL) AND role_id IS NULL;
  
  UPDATE profiles 
  SET role_id = admin_role_id 
  WHERE role = 'admin' AND role_id IS NULL;
  
  UPDATE profiles 
  SET role_id = moderator_role_id 
  WHERE role = 'moderator' AND role_id IS NULL;
END $$;

-- Step 5: Set default role for any profiles still without a role_id
UPDATE profiles 
SET role_id = (SELECT id FROM roles WHERE role_name = 'user')
WHERE role_id IS NULL;

-- Step 6: Make role_id NOT NULL
ALTER TABLE profiles ALTER COLUMN role_id SET NOT NULL;

-- Step 7: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);

-- Step 8: Drop the old role column (OPTIONAL - only if you're sure)
-- Uncomment this line only after verifying everything works
-- ALTER TABLE profiles DROP COLUMN IF EXISTS role;

COMMENT ON COLUMN profiles.role_id IS 'Foreign key reference to roles table. Replaced the old text-based role column.';
