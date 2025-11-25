-- Insert default privileges for common admin modules
INSERT INTO privileges (privilege_name, module_name, description) VALUES
  -- Dashboard
  ('dashboard.view', 'Dashboard', 'Access admin dashboard'),
  
  -- User Management
  ('users.view', 'User Management', 'View all users'),
  ('users.create', 'User Management', 'Create new users'),
  ('users.update', 'User Management', 'Update user details'),
  ('users.delete', 'User Management', 'Delete users'),
  
  -- Admin Users Management
  ('admin-users.view', 'Admin Users', 'View admin users'),
  ('admin-users.create', 'Admin Users', 'Create admin users'),
  ('admin-users.update', 'Admin Users', 'Update admin user details'),
  ('admin-users.delete', 'Admin Users', 'Delete admin users'),
  
  -- Admin Profile Management
  ('admin-profile.view', 'Admin Profile', 'View own admin profile'),
  ('admin-profile.update', 'Admin Profile', 'Update own admin profile'),
  
  -- Roles Management
  ('roles.view', 'Roles Management', 'View roles'),
  ('roles.create', 'Roles Management', 'Create roles'),
  ('roles.update', 'Roles Management', 'Update roles'),
  ('roles.delete', 'Roles Management', 'Delete roles'),
  ('roles.assign_privileges', 'Roles Management', 'Assign privileges to roles'),
  
  -- Event Management
  ('events.view', 'Event Management', 'View all events'),
  ('events.create', 'Event Management', 'Create events'),
  ('events.update', 'Event Management', 'Update events'),
  ('events.delete', 'Event Management', 'Delete events'),
  
  -- Categories Management
  ('categories.view', 'Categories', 'View event categories'),
  ('categories.create', 'Categories', 'Create categories'),
  ('categories.update', 'Categories', 'Update categories'),
  ('categories.delete', 'Categories', 'Delete categories'),
  
  -- Locations Management
  ('locations.view', 'Locations', 'View locations'),
  ('locations.create', 'Locations', 'Create locations'),
  ('locations.update', 'Locations', 'Update locations'),
  ('locations.delete', 'Locations', 'Delete locations'),
  
  -- Enums/Settings Data
  ('enums.view', 'Enums', 'View enum values'),
  ('enums.create', 'Enums', 'Create enum values'),
  ('enums.update', 'Enums', 'Update enum values'),
  ('enums.delete', 'Enums', 'Delete enum values'),
  
  -- Waivers Management
  ('waivers.view', 'Waivers', 'View waivers'),
  ('waivers.create', 'Waivers', 'Create waivers'),
  ('waivers.update', 'Waivers', 'Update waivers'),
  ('waivers.delete', 'Waivers', 'Delete waivers'),
  
  -- Payments Management
  ('payments.view', 'Payments', 'View payments'),
  ('payments.update', 'Payments', 'Update payment status'),
  
  -- Subscriptions Management
  ('subscriptions.view', 'Subscriptions', 'View subscriptions'),
  ('subscriptions.update', 'Subscriptions', 'Update subscriptions'),
  
  -- Email Templates Management
  ('email-templates.view', 'Email Templates', 'View email templates'),
  ('email-templates.create', 'Email Templates', 'Create email templates'),
  ('email-templates.update', 'Email Templates', 'Update email templates'),
  ('email-templates.delete', 'Email Templates', 'Delete email templates'),
  
  -- Contact Messages Management
  ('contacts.view', 'Contacts', 'View contact messages'),
  ('contacts.delete', 'Contacts', 'Delete contact messages'),
  
  -- Affiliates Management
  ('affiliates.view', 'Affiliates', 'View affiliates'),
  ('affiliates.update', 'Affiliates', 'Update affiliate status'),
  
  -- Analytics
  ('analytics.view', 'Analytics', 'View analytics reports'),
  
  -- Content Management
  ('content.view', 'Content', 'View content'),
  ('content.create', 'Content', 'Create content'),
  ('content.update', 'Content', 'Update content'),
  ('content.delete', 'Content', 'Delete content'),
  
  -- Settings
  ('settings.view', 'Settings', 'View settings'),
  ('settings.update', 'Settings', 'Update settings'),
  
  -- Recipients/Notifications
  ('recipients.view', 'Recipients', 'View email recipients'),
  ('recipients.create', 'Recipients', 'Create recipients'),
  ('recipients.update', 'Recipients', 'Update recipients'),
  ('recipients.delete', 'Recipients', 'Delete recipients'),
  
  -- System
  ('change-password.update', 'System', 'Change password')
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
