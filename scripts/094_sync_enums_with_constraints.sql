-- Migration: Sync enum values with event_type constraint
-- This script updates the enums table to match the CHECK constraints in events table
-- It also stores the enum_value column to map display names to constraint values

-- Add enum_value column if it doesn't exist
ALTER TABLE enums ADD COLUMN IF NOT EXISTS enum_value TEXT;

-- Delete old event_type enums that don't match the constraint
DELETE FROM enums 
WHERE enum_type = 'event_type' 
AND enum_title NOT IN ('Speed Dating', 'Social Mixer', 'Activity', 'Dinner', 'Other');

-- Insert or update event_type enums to match constraint values
INSERT INTO enums (enum_type, enum_title, enum_value, display_order, status)
VALUES
  ('event_type', 'Speed Dating', 'speed_dating', 1, 'active'),
  ('event_type', 'Social Mixer', 'social_mixer', 2, 'active'),
  ('event_type', 'Activity', 'activity', 3, 'active'),
  ('event_type', 'Dinner', 'dinner', 4, 'active'),
  ('event_type', 'Other', 'other', 5, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE 
SET enum_value = EXCLUDED.enum_value, status = 'active', updated_at = NOW();

-- Update gender_limitation enums to match constraint values
DELETE FROM enums 
WHERE enum_type = 'gender_limitation' 
AND enum_title NOT IN ('All Genders', 'Male Only', 'Female Only', 'Non-Binary Only');

INSERT INTO enums (enum_type, enum_title, enum_value, display_order, status)
VALUES
  ('gender_limitation', 'All Genders', 'all_genders', 1, 'active'),
  ('gender_limitation', 'Male Only', 'male_only', 2, 'active'),
  ('gender_limitation', 'Female Only', 'female_only', 3, 'active'),
  ('gender_limitation', 'Non-Binary Only', 'non_binary_only', 4, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE 
SET enum_value = EXCLUDED.enum_value, status = 'active', updated_at = NOW();

-- Update venue_type enums to match constraint values
DELETE FROM enums 
WHERE enum_type = 'venue_type' 
AND enum_title NOT IN ('Indoor', 'Outdoor', 'Hybrid', 'Online');

INSERT INTO enums (enum_type, enum_title, enum_value, display_order, status)
VALUES
  ('venue_type', 'Indoor', 'indoor', 1, 'active'),
  ('venue_type', 'Outdoor', 'outdoor', 2, 'active'),
  ('venue_type', 'Hybrid', 'hybrid', 3, 'active'),
  ('venue_type', 'Online', 'online', 4, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE 
SET enum_value = EXCLUDED.enum_value, status = 'active', updated_at = NOW();

-- Verify the updates
SELECT 
  enum_type,
  COUNT(*) as count,
  STRING_AGG(enum_title, ', ' ORDER BY enum_title) as titles,
  STRING_AGG(enum_value, ', ' ORDER BY enum_value) as values
FROM enums
WHERE enum_type IN ('event_type', 'venue_type', 'gender_limitation')
GROUP BY enum_type
ORDER BY enum_type;
