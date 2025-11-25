-- ========================================================
-- CREATE TEST EVENTS
-- ========================================================
-- This script creates test events for coupon redemption testing
-- Run this AFTER running REFERRAL_REWARDS_TESTING.sql

-- ===================================
-- CONFIGURATION VARIABLES
-- ===================================
-- CHANGE THESE VALUES TO CREATE EVENTS FOR DIFFERENT USERS
-- Simply replace the UUID values below with your organizer UUID

-- Configuration values (EDIT THESE):
-- User/Organizer UUID
-- Event title and price

-- STEP 1: Create Test Event
-- Replace the UUID and values below with your own
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
  'After Work Activity Test',
  'Test event for coupon redemption validation',
  'after_work_activity',
  'Test Location Hall',
  '123 Test Street Suite 100',
  'Test City',
  'TS',
  'USA',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '8 days',
  100,
  50.00,
  'upcoming',
  'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
)
RETURNING id, title, price, created_at;
-- Expected: Event created successfully with returned ID
-- Copy the id value - you'll need it for coupon redemption


-- ===================================
-- STEP 2: List All Events for This Organizer
-- ===================================
-- Replace 'ccbf423c-a773-4f23-bcf8-8aa06133ca58' with your user UUID
SELECT 
  id,
  title,
  price,
  status,
  capacity,
  start_date,
  created_at
FROM public.events
WHERE organizer_id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
ORDER BY created_at DESC;
-- Expected: List of events including the newly created one


-- ===================================
-- STEP 3: Get Event ID for Coupon Redemption
-- ===================================
-- Replace 'ccbf423c-a773-4f23-bcf8-8aa06133ca58' with your user UUID
-- Replace 'After Work Activity Test' with your event title
SELECT 
  id as event_id,
  title,
  price
FROM public.events
WHERE organizer_id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid
AND title = 'After Work Activity Test'
LIMIT 1;
-- COPY the event_id returned here - you'll need it for redemption testing
-- Use this ID in the coupon redemption endpoints


-- ===================================
-- CLEANUP (Optional - Remove Test Events)
-- ===================================
-- Uncomment to delete test events
-- DELETE FROM public.events 
-- WHERE organizer_id = 'ccbf423c-a773-4f23-bcf8-8aa06133ca58'::uuid 
-- AND title = 'After Work Activity Test';


-- ===================================
-- NOTES FOR TESTING
-- ===================================
-- 1. Run REFERRAL_REWARDS_TESTING.sql first to generate coupons
-- 2. Run this script to create test events
-- 3. Use the event_id from STEP 3 to redeem coupons
-- 4. Test the coupon redemption flow with API endpoints or checkout form
