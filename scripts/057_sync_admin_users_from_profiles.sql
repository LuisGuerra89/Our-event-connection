-- Sync admin users from profiles table to admin_users table
-- This will create admin_users entries for any profile with admin or moderator role

-- First, ensure user_id has a unique constraint
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_user_id_key;
ALTER TABLE admin_users ADD CONSTRAINT admin_users_user_id_key UNIQUE (user_id);

-- Now sync the data
INSERT INTO admin_users (
  user_id,
  username,
  first_name,
  last_name,
  email,
  mobile,
  role_id,
  status,
  created_at,
  updated_at
)
SELECT 
  p.id as user_id,
  COALESCE(LOWER(REGEXP_REPLACE(p.full_name, '[^a-zA-Z0-9]', '', 'g')), 'user_' || SUBSTRING(p.id::text, 1, 8)) as username,
  COALESCE(SPLIT_PART(p.full_name, ' ', 1), 'Admin') as first_name,
  NULLIF(TRIM(SUBSTRING(p.full_name FROM POSITION(' ' IN p.full_name))), '') as last_name,
  p.email,
  p.phone as mobile,
  p.role_id,
  'active' as status,
  p.created_at,
  NOW() as updated_at
FROM profiles p
INNER JOIN roles r ON p.role_id = r.id
WHERE r.role_name IN ('admin', 'moderator')
AND NOT EXISTS (
  SELECT 1 FROM admin_users au WHERE au.user_id = p.id
)
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  role_id = EXCLUDED.role_id,
  updated_at = NOW();

-- Show results
SELECT 
  au.id,
  au.username,
  au.first_name,
  au.last_name,
  au.email,
  au.status,
  r.role_name,
  au.created_at
FROM admin_users au
LEFT JOIN roles r ON au.role_id = r.id
ORDER BY au.created_at DESC;
