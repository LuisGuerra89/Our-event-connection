-- Update event_type constraint to include new sports-related types
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_event_type_check;

-- Add the updated constraint with new event types for the sports categories
ALTER TABLE events 
ADD CONSTRAINT events_event_type_check 
CHECK (event_type IN (
  'speed_dating', 
  'social_mixer', 
  'activity', 
  'dinner', 
  'sports',
  'extreme_sports',
  'water_sports',
  'winter_sports',
  'travel',
  'after_work',
  'weekend_activity',
  'other'
));

-- Also update venue_type constraint to include 'other'
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_venue_type_check;

ALTER TABLE events 
ADD CONSTRAINT events_venue_type_check 
CHECK (venue_type IN ('indoor', 'outdoor', 'hybrid', 'online', 'other'));
