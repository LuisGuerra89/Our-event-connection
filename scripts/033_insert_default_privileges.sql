-- Insert default privileges for common admin modules
INSERT INTO privileges (privilege_name, module_name, description) VALUES
  -- User Management
  ('users.view', 'User Management', 'View all users'),
  ('users.create', 'User Management', 'Create new users'),
  ('users.update', 'User Management', 'Update user details'),
  ('users.delete', 'User Management', 'Delete users'),
  
  -- Admin Users
  ('admin_users.view', 'Admin Users', 'View admin users'),
  ('admin_users.create', 'Admin Users', 'Create admin users'),
  ('admin_users.update', 'Admin Users', 'Update admin users'),
  ('admin_users.delete', 'Admin Users', 'Delete admin users'),
  
  -- Roles Management
  ('roles.view', 'Roles Management', 'View roles'),
  ('roles.create', 'Roles Management', 'Create roles'),
  ('roles.update', 'Roles Management', 'Update roles'),
  ('roles.delete', 'Roles Management', 'Delete roles'),
  ('roles.assign_privileges', 'Roles Management', 'Assign privileges to roles'),
  
  -- Event Management
  ('events.view', 'Event Management', 'View events'),
  ('events.create', 'Event Management', 'Create events'),
  ('events.update', 'Event Management', 'Update events'),
  ('events.delete', 'Event Management', 'Delete events'),
  
  -- Settings
  ('settings.view', 'Settings', 'View settings'),
  ('settings.update', 'Settings', 'Update settings'),
  
  -- Analytics
  ('analytics.view', 'Analytics', 'View analytics'),
  
  -- Waivers
  ('waivers.view', 'Waivers', 'View waivers'),
  
  -- Payments
  ('payments.view', 'Payments', 'View payments'),
  
  -- Content Management
  ('content.view', 'Content Management', 'View content'),
  ('content.create', 'Content Management', 'Create content'),
  ('content.update', 'Content Management', 'Update content'),
  ('content.delete', 'Content Management', 'Delete content')
ON CONFLICT (privilege_name) DO NOTHING;

-- Create admin role if it doesn't exist
INSERT INTO roles (role_name, description, status) 
VALUES ('admin', 'Full system administrator', 'active')
ON CONFLICT (role_name) DO NOTHING;

-- Assign all privileges to admin role
INSERT INTO role_privileges (role_id, privilege_id)
SELECT 
  (SELECT id FROM roles WHERE role_name = 'admin'),
  id
FROM privileges
ON CONFLICT (role_id, privilege_id) DO NOTHING;
