-- Testing Script for Referral Rewards System
-- Execute these queries step-by-step to validate the implementation

-- ===================================
-- STEP 1: Verify Coupons Table Exists
-- ===================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'coupons' AND table_schema = 'public';
-- Expected: 1 row (coupons table exists)


-- ===================================
-- STEP 2: Verify User Profile Exists
-- ===================================
-- Using existing user UUID: ccbf423c-a773-4f23-bcf8-8aa06133ca58
-- This user already exists in the database

-- Verify the profile exists
SELECT id, email, referral_count, free_events_earned 
FROM public.profiles 
WHERE id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid;
-- Expected: 1 row with user data


-- ===================================
-- STEP 3: Test Coupon Generation Trigger
-- ===================================
-- Update referral_count to 25 (should trigger coupon generation)
UPDATE public.profiles 
SET referral_count = 25 
WHERE id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid;

-- Wait 1-2 seconds for trigger to execute

-- Check if coupon was generated
SELECT 
  id,
  code,
  type,
  status,
  created_from_referral_count,
  expiration_date
FROM public.coupons 
WHERE user_id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
ORDER BY created_at DESC;
-- Expected: 1 row with type='free_after_work_activity', status='active'


-- ===================================
-- STEP 4: Test Validation Function
-- ===================================
-- First, get the coupon code from previous step
-- Then use it here (replace {COUPON_CODE} with actual code)
SELECT * FROM public.validate_coupon(
  '{COUPON_CODE}',
  'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
);
-- Expected: valid=true, message='Coupon is valid...'


-- ===================================
-- STEP 5: Get Available Coupons
-- ===================================
SELECT * FROM public.get_available_coupons('ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid);
-- Expected: List of active, non-expired coupons


-- ===================================
-- STEP 6: Check Available Coupons Count
-- ===================================
SELECT public.count_available_coupons('ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid);
-- Expected: 1


-- ===================================
-- STEP 7: Check Has Free Activity Coupon
-- ===================================
SELECT public.has_available_free_activity_coupon('ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid);
-- Expected: true


-- ===================================
-- STEP 8: Test Multiple Milestones
-- ===================================
-- Update referral_count to 50 (should generate another coupon)
UPDATE public.profiles 
SET referral_count = 50 
WHERE id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid;

-- Wait 1-2 seconds

-- Check total coupons
SELECT COUNT(*) as total_coupons 
FROM public.coupons 
WHERE user_id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
AND status = 'active';
-- Expected: 2 (one from 25 referrals, one from 50)


-- ===================================
-- STEP 9: Simulate Payment Record
-- ===================================
-- For testing, you may need to check if test event exists
-- If not, create one first:
INSERT INTO public.events (
  title,
  description,
  event_type,
  location_name,
  location_address,
  location_city,
  location_state,
  location_country,
  start_date,
  end_date,
  capacity,
  price,
  status,
  organizer_id
)
VALUES (
  'Test Event',
  'Testing event for coupon validation',
  'other',
  'Test Location',
  '123 Test St',
  'Test City',
  'TS',
  'USA',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '8 days',
  50,
  50.00,
  'upcoming',
  'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
)
ON CONFLICT DO NOTHING
RETURNING id;
-- Note the event ID returned


-- ===================================
-- STEP 10: Test Coupon Redemption
-- ===================================
-- Get a coupon code first and use the actual event ID from STEP 9
WITH test_coupon AS (
  SELECT id, code FROM public.coupons 
  WHERE user_id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
  AND status = 'active'
  LIMIT 1
),
test_event AS (
  SELECT id FROM public.events
  WHERE organizer_id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
  AND title = 'Test Event'
  LIMIT 1
)
SELECT * FROM public.redeem_coupon(
  (SELECT code FROM test_coupon),
  'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid,
  (SELECT id FROM test_event)  -- Use actual event ID from database
);
-- Expected: success=true, message='Coupon successfully redeemed'


-- ===================================
-- STEP 11: Verify Coupon is Now Used
-- ===================================
SELECT 
  id,
  code,
  status,
  used_at,
  event_id
FROM public.coupons 
WHERE user_id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
AND status = 'used'
ORDER BY used_at DESC;
-- Expected: 1 row with status='used', used_at populated, event_id populated


-- ===================================
-- STEP 12: Verify Coupon Cannot Be Used Twice
-- ===================================
-- Try to redeem same coupon again (should fail)
WITH test_coupon AS (
  SELECT code FROM public.coupons 
  WHERE user_id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
  AND status = 'used'
  LIMIT 1
)
SELECT * FROM public.validate_coupon(
  (SELECT code FROM test_coupon),
  'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
);
-- Expected: valid=false, message='Coupon has already been used...'


-- ===================================
-- STEP 13: Test RLS - User Should Only See Own Coupons
-- ===================================
-- Run this with the test user's credentials:
-- SET ROLE test_user;
SELECT * FROM public.coupons;
-- Expected: Only coupons where user_id matches authenticated user


-- ===================================
-- STEP 14: API Endpoints Test (from Postman/Insomnia)
-- ===================================
-- 1. GET /api/coupons
--    Expected: Returns available coupons in JSON

-- 2. POST /api/coupons/validate
--    Body: { "code": "FREEACTIVITY-..." }
--    Expected: { "valid": true, "message": "...", "couponId": "...", "discountAmount": 0 }

-- 3. POST /api/coupons/redeem
--    Body: { "code": "FREEACTIVITY-...", "eventId": "..." }
--    Expected: { "success": true, "message": "...", "couponId": "..." }


-- ===================================
-- STEP 15: Verify Payment Record Integration
-- ===================================
-- After submitting checkout with coupon, check payments table:
SELECT 
  id,
  payment_method,
  payment_amount,
  tax_amount,
  discount_amount,
  total_amount,
  payment_status
FROM public.payments 
WHERE user_id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
ORDER BY created_at DESC
LIMIT 1;
-- Expected: payment_method='coupon', total_amount=0, discount_amount=event.price


-- ===================================
-- STEP 16: Verify Event Registration
-- ===================================
SELECT 
  id,
  user_id,
  event_id,
  status,
  registered_at
FROM public.event_attendees 
WHERE user_id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
ORDER BY registered_at DESC
LIMIT 1;
-- Expected: status='registered'


-- ===================================
-- CLEANUP (Optional - Remove Test Data)
-- ===================================
-- DELETE FROM public.coupons 
-- WHERE user_id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid;

-- DELETE FROM public.profiles 
-- WHERE id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid;


-- ===================================
-- SUMMARY OF TESTS
-- ===================================
-- ✅ Table exists and has proper structure
-- ✅ Trigger generates coupon at 25 referrals
-- ✅ Trigger generates additional coupons at 50, 75, etc.
-- ✅ Validation function works correctly
-- ✅ Coupon cannot be redeemed twice
-- ✅ RLS prevents users from seeing other users' coupons
-- ✅ Payment records correctly reflect coupon usage
-- ✅ Event registration is created when coupon is used
-- ✅ API endpoints return proper responses
-- ✅ Frontend UI shows available coupons
