-- Admin Users table for managing admin accounts separately from regular users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  mobile TEXT,
  role_id UUID REFERENCES roles(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "admin_users_select_admin" ON admin_users;
DROP POLICY IF EXISTS "admin_users_insert_admin" ON admin_users;
DROP POLICY IF EXISTS "admin_users_update_admin" ON admin_users;
DROP POLICY IF EXISTS "admin_users_delete_admin" ON admin_users;

-- Policies
CREATE POLICY "admin_users_select_admin" ON admin_users FOR SELECT USING (is_admin());
CREATE POLICY "admin_users_insert_admin" ON admin_users FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admin_users_update_admin" ON admin_users FOR UPDATE USING (is_admin());
CREATE POLICY "admin_users_delete_admin" ON admin_users FOR DELETE USING (is_admin());

-- Indexes
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role_id ON admin_users(role_id);
