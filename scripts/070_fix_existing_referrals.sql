-- Fix existing referrals that were created before trigger was installed
-- This script manually processes referrals that have referred_by but no referral record

DO $$
DECLARE
  profile_record RECORD;
  referrer_record RECORD;
  current_count INTEGER;
BEGIN
  -- Find all profiles with referred_by but no referral record
  FOR profile_record IN
    SELECT p.id, p.referred_by, p.email
    FROM profiles p
    WHERE p.referred_by IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM referrals r 
        WHERE r.referred_id = p.id
      )
  LOOP
    RAISE NOTICE 'Processing referral for user: % (referred by: %)', 
      profile_record.email, profile_record.referred_by;
    
    -- Get referrer's referral code
    SELECT referral_code INTO referrer_record
    FROM profiles
    WHERE id = profile_record.referred_by;
    
    -- Create referral record
    INSERT INTO referrals (
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
      profile_record.referred_by,
      profile_record.id,
      COALESCE(referrer_record.referral_code, 'MANUAL_FIX'),
      NOW(),
      'completed',
      false,
      NOW(),
      NOW()
    )
    ON CONFLICT (barcode) DO NOTHING;
    
    -- Increment referrer's referral count
    UPDATE profiles
    SET referral_count = COALESCE(referral_count, 0) + 1
    WHERE id = profile_record.referred_by
    RETURNING referral_count INTO current_count;
    
    RAISE NOTICE 'Updated referrer count to: %', current_count;
    
    -- Check if milestone reached (every 25 referrals)
    IF current_count % 25 = 0 THEN
      UPDATE profiles
      SET free_events_earned = COALESCE(free_events_earned, 0) + 1
      WHERE id = profile_record.referred_by;
      
      -- Mark referral as rewarded
      UPDATE referrals
      SET reward_given = true
      WHERE referred_id = profile_record.id;
      
      RAISE NOTICE 'Milestone reached! Awarded free event';
    END IF;
    
    -- Create notification for referrer
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      read,
      created_at
    )
    VALUES (
      profile_record.referred_by,
      'referral',
      'New Referral!',
      'Someone joined using your referral code!',
      false,
      NOW()
    );
    
  END LOOP;
  
  RAISE NOTICE 'Finished processing existing referrals';
END $$;

-- Verify the fix
SELECT 
  'After fix - Profiles with referred_by but no referral record' as check_name,
  COUNT(*) as count
FROM profiles p
WHERE p.referred_by IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM referrals r 
    WHERE r.referred_id = p.id
  );

-- Show updated referral counts
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.referral_code,
  p.referral_count,
  (SELECT COUNT(*) FROM referrals WHERE referrer_id = p.id) as actual_referrals
FROM profiles p
WHERE p.referral_count > 0 OR EXISTS (
  SELECT 1 FROM referrals WHERE referrer_id = p.id
)
ORDER BY p.referral_count DESC;
