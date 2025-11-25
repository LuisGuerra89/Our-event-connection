-- Check profiles with admin/moderator role for staff verification
-- Note: admin_users table has been eliminated, all user data is now in profiles table
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.phone,
  p.location_country,
  p.location_state,
  p.location_city,
  r.role_name,
  p.is_profile_complete,
  p.created_at
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE r.role_name IN ('admin', 'moderator')
ORDER BY p.created_at DESC;
