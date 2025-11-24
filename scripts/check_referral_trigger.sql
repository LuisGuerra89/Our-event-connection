-- Check if process_referral trigger is configured correctly

-- 1. Check if trigger exists
SELECT 
  'process_referral_trigger exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'process_referral_trigger'
    ) 
    THEN '✅ YES' 
    ELSE '❌ NO' 
  END as status;

-- 2. Check trigger configuration
SELECT 
  t.tgname as trigger_name,
  c.relname as table_name,
  CASE t.tgtype::int & 66
    WHEN 2 THEN 'BEFORE'
    WHEN 64 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END as timing,
  CASE t.tgtype::int & 28
    WHEN 4 THEN 'INSERT'
    WHEN 8 THEN 'DELETE'  
    WHEN 16 THEN 'UPDATE'
    WHEN 20 THEN 'INSERT OR UPDATE'
    WHEN 28 THEN 'INSERT OR DELETE OR UPDATE'
    ELSE 'OTHER'
  END as event,
  pg_get_triggerdef(t.oid) as full_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname = 'process_referral_trigger';

-- 3. Check if process_referral function exists
SELECT 
  'process_referral function' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'process_referral') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status;

-- 4. Test the trigger manually
-- This simulates what should happen when referred_by is updated
DO $$
DECLARE
  test_user_id UUID;
  test_referrer_id UUID;
  initial_count INTEGER;
  final_count INTEGER;
BEGIN
  -- Get two existing users for testing
  SELECT id INTO test_referrer_id FROM profiles WHERE referral_code IS NOT NULL LIMIT 1;
  SELECT id INTO test_user_id FROM profiles WHERE id != test_referrer_id AND referred_by IS NULL LIMIT 1;
  
  IF test_referrer_id IS NULL OR test_user_id IS NULL THEN
    RAISE NOTICE 'Not enough users to test trigger';
    RETURN;
  END IF;
  
  -- Get initial referral count
  SELECT COALESCE(referral_count, 0) INTO initial_count 
  FROM profiles WHERE id = test_referrer_id;
  
  RAISE NOTICE 'Testing trigger with referrer: % (initial count: %)', test_referrer_id, initial_count;
  
  -- Update referred_by (this should trigger process_referral)
  UPDATE profiles 
  SET referred_by = test_referrer_id 
  WHERE id = test_user_id;
  
  -- Get final referral count
  SELECT COALESCE(referral_count, 0) INTO final_count 
  FROM profiles WHERE id = test_referrer_id;
  
  RAISE NOTICE 'After trigger: count changed from % to %', initial_count, final_count;
  
  -- Rollback the test
  UPDATE profiles SET referred_by = NULL WHERE id = test_user_id;
  
  IF final_count > initial_count THEN
    RAISE NOTICE '✅ Trigger is working!';
  ELSE
    RAISE NOTICE '❌ Trigger did NOT update count';
  END IF;
END $$;

-- 5. Check recent referrals
SELECT 
  'Recent referrals' as info,
  COUNT(*) as total_referrals,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as last_hour
FROM referrals;

-- 6. Check profiles with referred_by but no referral record
SELECT 
  'Profiles with referred_by but no referral record' as issue,
  COUNT(*) as count
FROM profiles p
WHERE p.referred_by IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM referrals r 
    WHERE r.referred_id = p.id
  );
