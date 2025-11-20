-- Migration: Create admin user profile trigger
-- This trigger automatically creates a profile record when a new admin/moderator user is created
-- Purpose: Ensure staff (admins, moderators) have corresponding profiles for role-based access control

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS admin_user_profile_trigger ON public.admin_users;
DROP FUNCTION IF EXISTS public.handle_admin_user_profile();

-- Create function that auto-creates profile for staff users
CREATE OR REPLACE FUNCTION public.handle_admin_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  staff_role text;
BEGIN
  -- Determine the staff role based on the role_id (you may need to adjust this logic)
  -- For now, we default to 'admin' - you can modify this if needed
  staff_role := COALESCE(
    (SELECT 'admin'), -- Default role
    'admin'
  );

  -- When a record is inserted into admin_users, create a corresponding profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    role_id,
    is_profile_complete,
    created_at,
    updated_at
  ) VALUES (
    NEW.user_id,
    NEW.email,
    COALESCE(NEW.first_name || ' ' || NEW.last_name, NEW.email),
    staff_role,
    NEW.role_id,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = staff_role,
    email = NEW.email,
    full_name = COALESCE(NEW.first_name || ' ' || NEW.last_name, NEW.email),
    role_id = NEW.role_id,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after admin_users insert
CREATE TRIGGER admin_user_profile_trigger
AFTER INSERT ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.handle_admin_user_profile();
