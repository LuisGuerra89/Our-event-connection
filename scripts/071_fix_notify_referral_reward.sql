-- Fix notify_referral_reward function to use correct column name
-- The function was using user_id instead of id

-- Drop trigger first (it's called trigger_notify_referral_reward, not notify_referral_reward_trigger)
DROP TRIGGER IF EXISTS trigger_notify_referral_reward ON referrals;
DROP TRIGGER IF EXISTS notify_referral_reward_trigger ON referrals;

-- Drop function with CASCADE to remove any remaining dependent triggers
DROP FUNCTION IF EXISTS notify_referral_reward() CASCADE;

CREATE OR REPLACE FUNCTION notify_referral_reward()
RETURNS TRIGGER AS $$
DECLARE
  referrer_count INTEGER;
  referrer_free_events INTEGER;
BEGIN
  -- Get referrer's current counts
  SELECT referral_count, free_events_earned 
  INTO referrer_count, referrer_free_events
  FROM profiles 
  WHERE id = NEW.referrer_id;  -- Changed from user_id to id
  
  -- Create notification for new referral
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    read,
    created_at
  )
  VALUES (
    NEW.referrer_id,
    'referral',
    'New Referral!',
    'Someone joined using your referral code!',
    false,
    NOW()
  );
  
  -- If milestone reached, create special notification
  IF referrer_count % 25 = 0 THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      read,
      created_at
    )
    VALUES (
      NEW.referrer_id,
      'referral',  -- Changed from 'reward' to 'referral' (allowed type)
      'Referral Milestone Reached!',
      format('Congratulations! You''ve reached %s referrals and earned a free event!', referrer_count),
      false,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER notify_referral_reward_trigger
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION notify_referral_reward();

COMMENT ON FUNCTION notify_referral_reward IS 'Creates notifications when referrals are processed. Fixed to use id instead of user_id.';
