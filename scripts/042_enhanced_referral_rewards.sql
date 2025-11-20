-- Enhanced function to process referrals and award free activities
-- This runs when a new user signs up with a referral code

CREATE OR REPLACE FUNCTION process_referral_reward()
RETURNS TRIGGER AS $$
DECLARE
  referrer_count INTEGER;
  free_activities_to_award INTEGER;
BEGIN
  -- Only process if the new user has a referred_by value
  IF NEW.referred_by IS NOT NULL THEN
    -- Increment the referrer's referral count
    UPDATE profiles
    SET referral_count = COALESCE(referral_count, 0) + 1
    WHERE id = NEW.referred_by;

    -- Get the updated referral count
    SELECT referral_count INTO referrer_count
    FROM profiles
    WHERE id = NEW.referred_by;

    -- Calculate how many free activities should be awarded (1 per 25 referrals)
    free_activities_to_award := FLOOR(referrer_count / 25);

    -- Update free_events_earned if needed
    UPDATE profiles
    SET free_events_earned = free_activities_to_award
    WHERE id = NEW.referred_by;

    -- Create referral record
    INSERT INTO referrals (referrer_id, referred_id, barcode, status, reward_given)
    VALUES (
      NEW.referred_by,
      NEW.id,
      CONCAT('REF-', NEW.referral_code),
      'completed',
      (referrer_count % 25 = 0) -- Mark as rewarded if this is the 25th referral
    );

    -- If this is the 25th, 50th, 75th referral, etc., mark it for reward
    IF referrer_count % 25 = 0 THEN
      UPDATE referrals
      SET status = 'rewarded',
          reward_type = 'free_after_work_activity',
          notes = 'Earned 1 FREE After Work Activity for 25 referrals'
      WHERE referrer_id = NEW.referred_by
        AND referred_id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS process_referral_reward_trigger ON profiles;

-- Create trigger that fires after a new profile is created
CREATE TRIGGER process_referral_reward_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION process_referral_reward();

-- Function to check if user has free activities available
CREATE OR REPLACE FUNCTION has_free_activities(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  free_count INTEGER;
BEGIN
  SELECT COALESCE(free_events_earned, 0) INTO free_count
  FROM profiles
  WHERE id = user_id;
  
  RETURN free_count > 0;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to redeem a free activity
CREATE OR REPLACE FUNCTION redeem_free_activity(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  free_count INTEGER;
BEGIN
  SELECT COALESCE(free_events_earned, 0) INTO free_count
  FROM profiles
  WHERE id = user_id;
  
  IF free_count > 0 THEN
    UPDATE profiles
    SET free_events_earned = free_events_earned - 1
    WHERE id = user_id;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
