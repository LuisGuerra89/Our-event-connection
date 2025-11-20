-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT UNIQUE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Privileges table
CREATE TABLE IF NOT EXISTS privileges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  privilege_name TEXT UNIQUE NOT NULL,
  module_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role Privileges mapping table
CREATE TABLE IF NOT EXISTS role_privileges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  privilege_id UUID REFERENCES privileges(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, privilege_id)
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE privileges ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_privileges ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "roles_select_admin" ON roles;
DROP POLICY IF EXISTS "roles_insert_admin" ON roles;
DROP POLICY IF EXISTS "roles_update_admin" ON roles;
DROP POLICY IF EXISTS "roles_delete_admin" ON roles;
DROP POLICY IF EXISTS "privileges_select_admin" ON privileges;
DROP POLICY IF EXISTS "role_privileges_select_admin" ON role_privileges;
DROP POLICY IF EXISTS "role_privileges_insert_admin" ON role_privileges;
DROP POLICY IF EXISTS "role_privileges_delete_admin" ON role_privileges;

CREATE POLICY "roles_select_admin" ON roles FOR SELECT USING (is_admin());
CREATE POLICY "roles_insert_admin" ON roles FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "roles_update_admin" ON roles FOR UPDATE USING (is_admin());
CREATE POLICY "roles_delete_admin" ON roles FOR DELETE USING (is_admin());

CREATE POLICY "privileges_select_admin" ON privileges FOR SELECT USING (is_admin());
CREATE POLICY "role_privileges_select_admin" ON role_privileges FOR SELECT USING (is_admin());
CREATE POLICY "role_privileges_insert_admin" ON role_privileges FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "role_privileges_delete_admin" ON role_privileges FOR DELETE USING (is_admin());

-- Indexes
CREATE INDEX idx_role_privileges_role_id ON role_privileges(role_id);
CREATE INDEX idx_role_privileges_privilege_id ON role_privileges(privilege_id);
