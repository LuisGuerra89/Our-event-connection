-- Ensure admin_users table has user_id column with unique constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='admin_users' 
        AND column_name='user_id'
    ) THEN
        ALTER TABLE admin_users ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
    END IF;
END $$;

-- Ensure user_id has a unique constraint
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_user_id_key;
ALTER TABLE admin_users ADD CONSTRAINT admin_users_user_id_key UNIQUE (user_id);

-- Ensure roles table has proper data
INSERT INTO roles (role_name, description, status)
VALUES 
  ('admin', 'System Administrator', 'active'),
  ('moderator', 'Content Moderator', 'active'),
  ('user', 'Regular User', 'active')
ON CONFLICT (role_name) DO NOTHING;

-- Function to check if user is admin (needed for password reset API)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check in profiles table first
  IF EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role_id IN (
      SELECT id FROM roles WHERE role_name IN ('admin', 'moderator')
    )
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check in admin_users table
  IF EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE user_id = auth.uid() 
    AND status = 'active'
    AND role_id IN (
      SELECT id FROM roles WHERE role_name IN ('admin', 'moderator')
    )
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
