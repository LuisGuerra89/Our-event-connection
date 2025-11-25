-- ========================================================
-- QUICK TEST: Referral Rewards System - Trigger Validation
-- ========================================================
-- This script ONLY tests the coupon generation trigger
-- Run this step-by-step and observe the results

-- ===================================
-- CONFIGURATION VARIABLES
-- ===================================
-- CHANGE THESE VALUES TO TEST WITH DIFFERENT USERS
-- Simply replace the UUID values below with your test user UUID
WITH config AS (
  SELECT 
    'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid as user_uuid
)
SELECT * FROM config;
-- Copy the user_uuid above and use it in all queries below


-- ===================================
-- STEP 1: Check Current User Profile
-- ===================================
-- Replace 'ccbf423c-a773-4f23-bcf8-8aa06133ca58' with your user UUID
SELECT 
  id,
  email,
  referral_count,
  free_events_earned
FROM public.profiles 
WHERE id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid;
-- Record the current referral_count value


-- ===================================
-- STEP 2: Check Current Coupons (Before Update)
-- ===================================
-- Replace 'ccbf423c-a773-4f23-bcf8-8aa06133ca58' with your user UUID
SELECT 
  COUNT(*) as total_coupons,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_coupons,
  COUNT(CASE WHEN status = 'used' THEN 1 END) as used_coupons
FROM public.coupons 
WHERE user_id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid;
-- Expected: Note the current counts


-- ===================================
-- STEP 3: UPDATE REFERRAL COUNT TO 25
-- ===================================
-- THIS SHOULD TRIGGER THE COUPON GENERATION!
-- Replace 'ccbf423c-a773-4f23-bcf8-8aa06133ca58' with your user UUID
UPDATE public.profiles 
SET referral_count = 25 
WHERE id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid;

-- OUTPUT: Should show "UPDATE 1"


-- ===================================
-- STEP 4: WAIT AND CHECK NEW COUPONS
-- ===================================
-- Wait 2-3 seconds, then run this query to see if coupon was generated:
-- Replace 'ccbf423c-a773-4f23-bcf8-8aa06133ca58' with your user UUID
SELECT 
  id,
  code,
  type,
  status,
  created_from_referral_count,
  discount_amount,
  expiration_date,
  created_at
FROM public.coupons 
WHERE user_id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
ORDER BY created_at DESC;
-- Expected: New row with:
--   - code starting with "FREEACTIVITY-"
--   - type = 'free_after_work_activity'
--   - status = 'active'
--   - created_from_referral_count = 25
--   - discount_amount = 0


-- ===================================
-- STEP 5: Test Validation Function
-- ===================================
-- First, get the coupon code from STEP 4 result
-- Then replace {COUPON_CODE} with the actual code value and your user UUID
SELECT * FROM public.validate_coupon(
  'FREEACTIVITY-ccbf423c-a773-4f23-bcf8-8aa06133ca58-1-XXXXX',
  'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
);
-- Expected: valid=true, message='Coupon is valid...'


-- ===================================
-- STEP 6: Get Available Coupons
-- ===================================
-- Replace 'ccbf423c-a773-4f23-bcf8-8aa06133ca58' with your user UUID
SELECT * FROM public.get_available_coupons('ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid);
-- Expected: List of active, non-expired coupons


-- ===================================
-- STEP 7: Check Available Coupons Count
-- ===================================
-- Replace 'ccbf423c-a773-4f23-bcf8-8aa06133ca58' with your user UUID
SELECT public.count_available_coupons('ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid);
-- Expected: 1


-- ===================================
-- STEP 8: Check Has Free Activity Coupon
-- ===================================
-- Replace 'ccbf423c-a773-4f23-bcf8-8aa06133ca58' with your user UUID
SELECT public.has_available_free_activity_coupon('ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid);
-- Expected: true


-- ===================================
-- STEP 9: Test Multiple Milestones
-- ===================================
-- Update referral_count to 50 (should generate another coupon)
-- Replace 'ccbf423c-a773-4f23-bcf8-8aa06133ca58' with your user UUID
UPDATE public.profiles 
SET referral_count = 50 
WHERE id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid;

-- Wait 1-2 seconds

-- Check total coupons
-- Replace 'ccbf423c-a773-4f23-bcf8-8aa06133ca58' with your user UUID
SELECT COUNT(*) as total_coupons 
FROM public.coupons 
WHERE user_id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
AND status = 'active';
-- Expected: 2 (one from 25 referrals, one from 50)


-- ===================================
-- STEP 10: Test 75 Referrals Milestone
-- ===================================
-- Replace 'ccbf423c-a773-4f23-bcf8-8aa06133ca58' with your user UUID
UPDATE public.profiles 
SET referral_count = 75 
WHERE id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid;

-- Wait 1-2 seconds

-- Check total coupons
-- Replace 'ccbf423c-a773-4f23-bcf8-8aa06133ca58' with your user UUID
SELECT COUNT(*) as total_coupons 
FROM public.coupons 
WHERE user_id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
AND status = 'active';
-- Expected: 3 (one from each milestone: 25, 50, 75)


-- ===================================
-- SUMMARY OF TESTS
-- ===================================
-- ✅ Trigger generates coupon at 25 referrals
-- ✅ Trigger generates additional coupons at 50, 75, etc.
-- ✅ Validation function works correctly
-- ✅ Functions count available coupons
-- ✅ Multiple milestones create multiple coupons
