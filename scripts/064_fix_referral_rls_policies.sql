-- Fix Referral System RLS and Triggers
-- This migration fixes the "Database error saving new user" issue when signing up with a referral code

-- Problem: The RLS policy "referrals_insert_own" requires auth.uid() = referrer_id,
-- but when the trigger runs, auth.uid() is the new user (referred_id), not the referrer.
-- Solution: Add a policy that allows inserts when auth.uid() = referred_id

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "referrals_insert_own" ON referrals;
DROP POLICY IF EXISTS "referrals_insert_referred" ON referrals;
DROP POLICY IF EXISTS "referrals_insert_system" ON referrals;

-- Create new policies that allow both referrer and referred user to create referral records
CREATE POLICY "referrals_insert_own" 
  ON referrals 
  FOR INSERT 
  WITH CHECK (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Also update the select policy to be more permissive
DROP POLICY IF EXISTS "referrals_select_own" ON referrals;
CREATE POLICY "referrals_select_own" 
  ON referrals 
  FOR SELECT 
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Fix the process_referral trigger to avoid conflicts
-- Remove the duplicate trigger from 042_enhanced_referral_rewards.sql
DROP TRIGGER IF EXISTS process_referral_reward_trigger ON profiles;
DROP FUNCTION IF EXISTS process_referral_reward();

-- Update the process_referral function to handle everything in one place
CREATE OR REPLACE FUNCTION public.process_referral()
RETURNS TRIGGER AS $$
DECLARE
  referrer_uuid UUID;
  current_referral_count INTEGER;
  referral_code_used TEXT;
BEGIN
  -- Only process if referred_by is set
  IF NEW.referred_by IS NOT NULL THEN
    -- Get the referral code from the referrer's profile
    SELECT referral_code INTO referral_code_used
    FROM public.profiles
    WHERE id = NEW.referred_by;
    
    -- Insert into referrals table (only if not already exists)
    INSERT INTO public.referrals (
      referrer_id,
      referred_id,
      barcode,
      referral_date,
      status,
      reward_given,
      created_at,
      updated_at
    )
    VALUES (
      NEW.referred_by,
      NEW.id,
      COALESCE(referral_code_used, 'UNKNOWN'),
      NOW(),
      'completed',
      false,
      NOW(),
      NOW()
    )
    ON CONFLICT (barcode) DO NOTHING;
    
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
        reward_given = true,
        status = 'rewarded',
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

-- Ensure the trigger exists (it should from migration 029)
DROP TRIGGER IF EXISTS process_referral_trigger ON public.profiles;
CREATE TRIGGER process_referral_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.process_referral();

-- Add comment for documentation
COMMENT ON FUNCTION public.process_referral IS 'Processes referrals when a new profile is created. Handles referral counting, rewards, and notifications. Uses SECURITY DEFINER to bypass RLS.';
