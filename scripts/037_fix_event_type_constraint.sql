-- Drop the old constraint if it exists
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_event_type_check;

-- Add the correct constraint matching our enum values
ALTER TABLE events 
ADD CONSTRAINT events_event_type_check 
CHECK (event_type IN ('speed_dating', 'social_mixer', 'activity', 'dinner', 'other'));

-- Also check and fix gender_limitation constraint if needed
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_gender_limitation_check;

ALTER TABLE events 
ADD CONSTRAINT events_gender_limitation_check 
CHECK (gender_limitation IN ('all_genders', 'male_only', 'female_only', 'non_binary_only'));

-- Check venue_type constraint
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_venue_type_check;

ALTER TABLE events 
ADD CONSTRAINT events_venue_type_check 
CHECK (venue_type IN ('indoor', 'outdoor', 'hybrid', 'online'));
