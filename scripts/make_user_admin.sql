-- Script to promote a user to admin role
-- This script updates the profiles table AND creates an entry in admin_users
-- Replace 'user@example.com' with the actual email address

-- Step 1: Get the user info and admin role ID
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_full_name TEXT;
  v_admin_role_id UUID;
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  -- Email to promote
  v_email := 'luis.guerra@ntsprint.com'; -- <-- CHANGE THIS EMAIL
  
  -- Get user info from profiles
  SELECT id, full_name INTO v_user_id, v_full_name
  FROM profiles
  WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found in profiles table', v_email;
  END IF;
  
  -- Get admin role ID from roles table
  SELECT id INTO v_admin_role_id
  FROM roles
  WHERE role_name = 'admin'
  LIMIT 1;
  
  IF v_admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Admin role not found in roles table';
  END IF;
  
  -- Parse full_name into first and last name
  v_first_name := COALESCE(SPLIT_PART(v_full_name, ' ', 1), 'Admin');
  v_last_name := NULLIF(SPLIT_PART(v_full_name, ' ', 2), '');
  
  -- Step 2: Update profiles table to set role to 'admin'
  UPDATE profiles
  SET role = 'admin', role_id = v_admin_role_id, updated_at = now()
  WHERE id = v_user_id;
  
  -- Step 3: Create entry in admin_users table if it doesn't exist
  INSERT INTO admin_users (
    user_id,
    username,
    first_name,
    last_name,
    email,
    role_id,
    status,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    COALESCE(v_email, 'admin_' || v_user_id::TEXT),
    v_first_name,
    v_last_name,
    v_email,
    v_admin_role_id,
    'active',
    now(),
    now()
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    role_id = v_admin_role_id,
    status = 'active',
    updated_at = now();
  
  RAISE NOTICE 'User % has been promoted to admin successfully', v_email;
END $$;

-- Verify the changes
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  r.role_name,
  au.username,
  au.status as admin_status
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
LEFT JOIN admin_users au ON p.id = au.user_id
WHERE p.email = 'luis.guerra@ntsprint.com'; -- <-- CHANGE THIS EMAIL

-- To see all admin users:
-- SELECT au.*, r.role_name, p.email as profile_email
-- FROM admin_users au
-- LEFT JOIN roles r ON au.role_id = r.id
-- LEFT JOIN profiles p ON au.user_id = p.id
-- WHERE r.role_name = 'admin';
