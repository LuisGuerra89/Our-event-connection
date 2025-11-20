-- Update handle_new_user function to detect social login and mark profile as incomplete

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
  new_referral_code TEXT;
  provider_name TEXT;
  is_social_login BOOLEAN;
BEGIN
  -- Count existing profiles
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Generate a unique referral code
  new_referral_code := UPPER(
    SUBSTRING(COALESCE(new.email, 'XX'), 1, 2) || 
    SUBSTRING(MD5(RANDOM()::TEXT), 1, 6)
  );
  
  -- Detect if this is a social login (Google, Facebook, etc.)
  -- Supabase stores provider in app_metadata or we can check if password is null
  provider_name := COALESCE(new.raw_app_metadata->>'provider', 'email');
  is_social_login := provider_name != 'email';
  
  -- Insert profile with all necessary fields
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
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
    CASE WHEN user_count = 0 THEN 'admin' ELSE 'user' END,
    new_referral_code,
    0,
    0,
    provider_name,
    NOT is_social_login, -- Social logins need to complete profile, email signups are complete
    NOW(),
    NOW()
  );
  
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
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
