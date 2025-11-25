-- Migration: Assign comprehensive privileges to moderator/editor role
-- Role ID: 28136400-463b-437d-9a95-835e830e5067
-- 
-- This script assigns all admin-related privileges to the specified role,
-- enabling full admin panel access with appropriate permission checks.

-- First, verify the role exists
-- SELECT * FROM roles WHERE id = '28136400-463b-437d-9a95-835e830e5067';

-- Delete existing privileges for this role
DELETE FROM role_privileges 
WHERE role_id = '28136400-463b-437d-9a95-835e830e5067';

-- Assign all privileges to this role
INSERT INTO role_privileges (role_id, privilege_id)
SELECT 
  '28136400-463b-437d-9a95-835e830e5067'::uuid as role_id,
  id
FROM privileges
WHERE privilege_name IN (
  -- Dashboard
  'dashboard.view',
  
  -- Admin Profile Management
  'admin-profile.view',
  'admin-profile.update',
  
  -- Admin Users Management
  'admin-users.view',
  'admin-users.create',
  'admin-users.update',
  'admin-users.delete',
  
  -- User Management
  'users.view',
  'users.create',
  'users.update',
  'users.delete',
  
  -- Roles Management
  'roles.view',
  'roles.create',
  'roles.update',
  'roles.delete',
  'roles.assign_privileges',
  
  -- Event Management
  'events.view',
  'events.create',
  'events.update',
  'events.delete',
  
  -- Categories
  'categories.view',
  'categories.create',
  'categories.update',
  'categories.delete',
  
  -- Locations
  'locations.view',
  'locations.create',
  'locations.update',
  'locations.delete',
  
  -- Enums/Settings Data
  'enums.view',
  'enums.create',
  'enums.update',
  'enums.delete',
  
  -- Waivers
  'waivers.view',
  'waivers.create',
  'waivers.update',
  'waivers.delete',
  
  -- Payments
  'payments.view',
  'payments.update',
  
  -- Subscriptions
  'subscriptions.view',
  'subscriptions.update',
  
  -- Email Templates
  'email-templates.view',
  'email-templates.create',
  'email-templates.update',
  'email-templates.delete',
  
  -- Contact Management
  'contacts.view',
  'contacts.delete',
  
  -- Affiliates
  'affiliates.view',
  'affiliates.update',
  
  -- Analytics
  'analytics.view',
  
  -- Content Management
  'content.view',
  'content.create',
  'content.update',
  'content.delete',
  
  -- Settings
  'settings.view',
  'settings.update',
  
  -- Recipients/Notifications
  'recipients.view',
  'recipients.create',
  'recipients.update',
  'recipients.delete',
  
  -- System
  'change-password.update'
)
ON CONFLICT (role_id, privilege_id) DO NOTHING;

-- Verify the assignment
SELECT 
  r.id,
  r.role_name,
  COUNT(p.privilege_name) as privilege_count,
  STRING_AGG(p.privilege_name, ', ' ORDER BY p.privilege_name) as privileges
FROM roles r
LEFT JOIN role_privileges rp ON r.id = rp.role_id
LEFT JOIN privileges p ON rp.privilege_id = p.id
WHERE r.id = '28136400-463b-437d-9a95-835e830e5067'
GROUP BY r.id, r.role_name;
