-- Script to populate country_id, state_id, and city_id for existing events
-- This matches text-based locations to the new location tables

-- STEP 1: Update country_id based on location_country text
UPDATE events e
SET country_id = c.id
FROM countries c
WHERE e.country_id IS NULL
  AND (
    LOWER(e.location_country) = LOWER(c.name)
    OR LOWER(e.location_country) = LOWER(c.code)
    OR (LOWER(e.location_country) = 'usa' AND c.code = 'US')
    OR (LOWER(e.location_country) = 'united states' AND c.code = 'US')
  );

-- STEP 2: Update state_id based on location_state text and country_id
UPDATE events e
SET state_id = s.id
FROM states s
WHERE e.state_id IS NULL
  AND e.country_id IS NOT NULL
  AND s.country_id = e.country_id
  AND (
    LOWER(e.location_state) = LOWER(s.name)
    OR LOWER(e.location_state) = LOWER(s.code)
  );

-- STEP 3: Update city_id based on location_city text and state_id
UPDATE events e
SET city_id = c.id
FROM cities c
WHERE e.city_id IS NULL
  AND e.state_id IS NOT NULL
  AND c.state_id = e.state_id
  AND LOWER(e.location_city) = LOWER(c.name);

-- Verify the results
SELECT 
  COUNT(*) as total_events,
  COUNT(country_id) as events_with_country_id,
  COUNT(state_id) as events_with_state_id,
  COUNT(city_id) as events_with_city_id,
  COUNT(CASE WHEN country_id IS NULL THEN 1 END) as missing_country,
  COUNT(CASE WHEN state_id IS NULL THEN 1 END) as missing_state,
  COUNT(CASE WHEN city_id IS NULL THEN 1 END) as missing_city
FROM events
WHERE status IN ('upcoming', 'ongoing')
  AND start_date >= NOW();
