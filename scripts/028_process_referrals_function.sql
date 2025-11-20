-- Function to process referrals after user registration
CREATE OR REPLACE FUNCTION process_referral()
RETURNS TRIGGER AS $$
DECLARE
  referrer_profile_id uuid;
  referrer_count integer;
BEGIN
  -- Check if user was referred (referral_code in metadata)
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    -- Find the referrer by referral code
    SELECT id INTO referrer_profile_id
    FROM public.profiles
    WHERE referral_code = NEW.raw_user_meta_data->>'referral_code';
    
    IF referrer_profile_id IS NOT NULL THEN
      -- Update the new user's referred_by field
      UPDATE public.profiles
      SET referred_by = referrer_profile_id
      WHERE id = NEW.id;
      
      -- Create referral record
      INSERT INTO public.referrals (referrer_id, referred_id)
      VALUES (referrer_profile_id, NEW.id);
      
      -- Increment referrer's referral count
      UPDATE public.profiles
      SET referral_count = referral_count + 1
      WHERE id = referrer_profile_id
      RETURNING referral_count INTO referrer_count;
      
      -- Grant free event if they've hit 25 referrals
      IF referrer_count % 25 = 0 THEN
        UPDATE public.profiles
        SET free_events_earned = free_events_earned + 1
        WHERE id = referrer_profile_id;
        
        -- Mark the referral that earned the reward
        UPDATE public.referrals
        SET reward_granted = true,
            reward_type = 'free_event'
        WHERE referrer_id = referrer_profile_id
        AND referred_id = NEW.id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to process referrals after profile creation
DROP TRIGGER IF EXISTS process_referral_trigger ON public.profiles;
CREATE TRIGGER process_referral_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION process_referral();
