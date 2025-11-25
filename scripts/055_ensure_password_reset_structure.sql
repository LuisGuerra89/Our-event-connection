-- Ensure roles table has proper data
INSERT INTO roles (role_name, description, status)
VALUES 
  ('admin', 'System Administrator', 'active'),
  ('moderator', 'Content Moderator', 'active'),
  ('user', 'Regular User', 'active')
ON CONFLICT (role_name) DO NOTHING;

-- Function to check if user is admin (needed for password reset API)
-- Uses SECURITY DEFINER to bypass RLS and check the profiles table
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check in profiles table only (admin_users table has been eliminated)
  IF EXISTS (
    SELECT 1 
    FROM profiles p
    INNER JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() 
    AND r.role_name IN ('admin', 'moderator')
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions for password reset
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

COMMENT ON FUNCTION is_admin() IS 'Check if the current user has admin or moderator role';
