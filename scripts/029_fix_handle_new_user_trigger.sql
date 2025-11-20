-- Fix the handle_new_user function to handle all profile columns properly
-- This ensures new users can sign up without database errors

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the handle_new_user function with proper column handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
  new_referral_code TEXT;
BEGIN
  -- Count existing profiles
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Generate a unique referral code (8 characters: first 2 of email + 6 random)
  new_referral_code := UPPER(
    SUBSTRING(COALESCE(new.email, 'XX'), 1, 2) || 
    SUBSTRING(MD5(RANDOM()::TEXT), 1, 6)
  );
  
  -- Insert profile with all necessary fields
  -- Only set fields that have values, let others use defaults or NULL
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    referral_code,
    referral_count,
    free_events_earned,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    CASE WHEN user_count = 0 THEN 'admin' ELSE 'user' END,
    new_referral_code,
    0, -- Initialize referral count
    0, -- Initialize free events earned
    NOW(),
    NOW()
  );
  
  -- Process referral if referral_code was provided during signup
  IF new.raw_user_meta_data->>'referral_code' IS NOT NULL AND 
     new.raw_user_meta_data->>'referral_code' != '' THEN
    -- This will be handled by a separate trigger on profiles insert
    -- Update the profile with the referrer information
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

-- Create or replace function to process referrals after profile creation
CREATE OR REPLACE FUNCTION public.process_referral()
RETURNS TRIGGER AS $$
DECLARE
  referrer_uuid UUID;
  current_referral_count INTEGER;
BEGIN
  -- Only process if referred_by is set
  IF NEW.referred_by IS NOT NULL THEN
    -- Insert into referrals table
    INSERT INTO public.referrals (
      referrer_id,
      referred_id,
      referral_date,
      status,
      created_at,
      updated_at
    )
    VALUES (
      NEW.referred_by,
      NEW.id,
      NOW(),
      'completed',
      NOW(),
      NOW()
    )
    ON CONFLICT DO NOTHING;
    
    -- Increment referrer's referral count
    UPDATE public.profiles
    SET 
      referral_count = COALESCE(referral_count, 0) + 1,
      updated_at = NOW()
    WHERE id = NEW.referred_by
    RETURNING referral_count INTO current_referral_count;
    
    -- Check if referrer has earned a free event (every 25 referrals)
    IF current_referral_count IS NOT NULL AND current_referral_count % 25 = 0 THEN
      UPDATE public.profiles
      SET 
        free_events_earned = COALESCE(free_events_earned, 0) + 1,
        updated_at = NOW()
      WHERE id = NEW.referred_by;
      
      -- Mark the referral as rewarded
      UPDATE public.referrals
      SET 
        reward_granted = true,
        reward_type = 'free_event',
        notes = 'Earned 1 free event pass for 25 referrals',
        updated_at = NOW()
      WHERE referrer_id = NEW.referred_by
        AND referred_id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the profile creation
    RAISE WARNING 'Error in process_referral: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the referral processing trigger
DROP TRIGGER IF EXISTS process_referral_trigger ON public.profiles;
CREATE TRIGGER process_referral_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.process_referral();
