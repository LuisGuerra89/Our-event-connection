-- Fix Referral Notifications
-- Issues fixed:
-- 1. Milestone notification was triggering at every referral (not just at 25)
-- 2. Count was showing 0 instead of actual count
-- 3. New referral notification should not show at milestone

-- Recreate the notify_referral_reward function with fixes
CREATE OR REPLACE FUNCTION public.notify_referral_reward()
RETURNS TRIGGER AS $$
DECLARE
  referrer_count INTEGER;
BEGIN
  -- Get the current referral count AFTER it has been incremented
  SELECT referral_count INTO referrer_count
  FROM profiles 
  WHERE id = NEW.referrer_id;
  
  -- Notification: New Referral (only if not a milestone)
  IF (referrer_count IS NULL OR referrer_count % 25 != 0) THEN
    INSERT INTO notifications (user_id, type, title, message, read, created_at)
    VALUES (
      NEW.referrer_id,
      'referral',
      'New Referral!',
      'Someone joined using your referral code!',
      false,
      NOW()
    );
  END IF;
  
  -- Notification: Milestone (only when exactly at 25, 50, 75, 100, etc.)
  IF referrer_count IS NOT NULL AND referrer_count > 0 AND referrer_count % 25 = 0 THEN
    INSERT INTO notifications (user_id, type, title, message, read, created_at)
    VALUES (
      NEW.referrer_id,
      'referral',
      'Referral Milestone Reached!',
      format('Congratulations! You''ve reached %s referrals and earned a free event!', referrer_count),
      false,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it uses the new function
DROP TRIGGER IF EXISTS trigger_notify_referral_reward ON referrals;
CREATE TRIGGER trigger_notify_referral_reward
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_referral_reward();

COMMIT;
