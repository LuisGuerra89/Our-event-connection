-- Check current admin users
SELECT 
  au.*,
  r.role_name,
  u.email as auth_email
FROM admin_users au
LEFT JOIN roles r ON au.role_id = r.id
LEFT JOIN auth.users u ON au.user_id = u.id;

-- Check profiles with admin role
SELECT 
  p.id,
  p.email,
  p.full_name,
  r.role_name
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE r.role_name IN ('admin', 'moderator');

-- If you need to create admin_users from existing profiles with admin role, uncomment this:
/*
INSERT INTO admin_users (
  user_id,
  username,
  first_name,
  last_name,
  email,
  mobile,
  role_id,
  status
)
SELECT 
  p.id as user_id,
  COALESCE(p.email, 'admin_' || p.id),
  COALESCE(SPLIT_PART(p.full_name, ' ', 1), 'Admin'),
  NULLIF(SPLIT_PART(p.full_name, ' ', 2), ''),
  p.email,
  p.phone,
  p.role_id,
  'active'
FROM profiles p
WHERE p.role_id IN (SELECT id FROM roles WHERE role_name IN ('admin', 'moderator'))
AND NOT EXISTS (
  SELECT 1 FROM admin_users au WHERE au.user_id = p.id
)
ON CONFLICT (email) DO NOTHING;
*/
