-- Query to check events with location IDs
-- This helps debug why events are not showing in domestic events section

-- Check all events with their location information
SELECT 
  e.id,
  e.title,
  e.status,
  e.start_date,
  -- Old location fields (text)
  e.location_city,
  e.location_state,
  e.location_country,
  -- New location IDs (foreign keys)
  e.country_id,
  e.state_id,
  e.city_id,
  -- Join to see actual location names
  co.name as country_name,
  co.code as country_code,
  st.name as state_name,
  ci.name as city_name
FROM events e
LEFT JOIN countries co ON e.country_id = co.id
LEFT JOIN states st ON e.state_id = st.id
LEFT JOIN cities ci ON e.city_id = ci.id
WHERE e.status IN ('upcoming', 'ongoing')
  AND e.start_date >= NOW()
ORDER BY e.start_date;

-- Check if events have NULL location IDs (need to be populated)
SELECT 
  COUNT(*) as total_upcoming_events,
  COUNT(country_id) as events_with_country_id,
  COUNT(state_id) as events_with_state_id,
  COUNT(city_id) as events_with_city_id
FROM events
WHERE status IN ('upcoming', 'ongoing')
  AND start_date >= NOW();

-- Find events that need location IDs populated
-- These events have text locations but no IDs
SELECT 
  e.id,
  e.title,
  e.location_city,
  e.location_state,
  e.location_country,
  e.country_id,
  e.state_id,
  e.city_id
FROM events e
WHERE status IN ('upcoming', 'ongoing')
  AND start_date >= NOW()
  AND (country_id IS NULL OR state_id IS NULL OR city_id IS NULL)
ORDER BY start_date;
