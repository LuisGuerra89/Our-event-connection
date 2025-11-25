-- DEPRECATED: Admin User Profile Trigger
-- This migration script is no longer needed.
-- The admin_users table has been eliminated and replaced with a role-based system.
-- 
-- Staff (admin/moderator) users are now managed directly in the profiles table
-- using role_id foreign key references. No trigger is needed.
--
-- To create a new admin/moderator user:
-- 1. Create a profile in the profiles table
-- 2. Set their role_id to reference the appropriate admin or moderator role
-- 3. Profile is immediately active for admin/moderator functions

-- Drop the old trigger and function if they exist (cleanup)
DROP TRIGGER IF EXISTS admin_user_profile_trigger ON public.admin_users;
DROP FUNCTION IF EXISTS public.handle_admin_user_profile();
