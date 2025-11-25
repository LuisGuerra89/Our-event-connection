-- Fix handle_new_user trigger to use role_id instead of role
-- This fixes the "Database error saving new user" error

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
  new_referral_code TEXT;
  provider_name TEXT;
  is_social_login BOOLEAN;
  default_role_id UUID;
BEGIN
  -- Count existing profiles
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Get the default 'user' role ID
  SELECT id INTO default_role_id FROM roles WHERE role_name = 'user' LIMIT 1;
  
  -- Generate a unique referral code (8 characters: first 2 of email + 6 random)
  new_referral_code := UPPER(
    SUBSTRING(COALESCE(new.email, 'XX'), 1, 2) || 
    SUBSTRING(MD5(RANDOM()::TEXT), 1, 6)
  );
  
  -- Detect if this is a social login (Google, Facebook, etc.)
  provider_name := COALESCE(new.raw_app_metadata->>'provider', 'email');
  is_social_login := provider_name != 'email';
  
  -- Insert profile with all necessary fields
  -- IMPORTANT: Using role_id instead of role (role column was removed in migration 032)
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role_id,  -- Changed from 'role' to 'role_id'
    referral_code,
    referral_count,
    free_events_earned,
    auth_provider,
    is_profile_complete,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    CASE 
      WHEN user_count = 0 THEN (SELECT id FROM roles WHERE role_name = 'admin' LIMIT 1)
      ELSE default_role_id 
    END,
    new_referral_code,
    0, -- Initialize referral count
    0, -- Initialize free events earned
    provider_name,
    NOT is_social_login, -- Social logins need to complete profile, email signups are complete
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
    role_id = COALESCE(profiles.role_id, EXCLUDED.role_id),
    updated_at = NOW();
  
  -- Process referral if referral_code was provided during signup
  IF new.raw_user_meta_data->>'referral_code' IS NOT NULL AND 
     new.raw_user_meta_data->>'referral_code' != '' THEN
    UPDATE public.profiles
    SET referred_by = (
      SELECT id FROM public.profiles 
      WHERE referral_code = new.raw_user_meta_data->>'referral_code'
      LIMIT 1
    )
    WHERE id = new.id;
  END IF;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates a profile when a new user signs up. Handles both email and social login. Uses role_id (not role text column).';
