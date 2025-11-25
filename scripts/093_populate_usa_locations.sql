-- Migration: Populate United States and its 50 states
-- This script adds United States as a country and all 50 US states
-- These records are protected from deletion via RLS policies

-- Disable RLS temporarily to insert data
ALTER TABLE countries DISABLE ROW LEVEL SECURITY;
ALTER TABLE states DISABLE ROW LEVEL SECURITY;

-- Step 1: Insert United States country
INSERT INTO countries (id, name, code, status)
VALUES ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'United States', 'US', 'active')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Verify insertion before continuing
-- This ensures the country exists before we try to insert states
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM countries WHERE id = '550e8400-e29b-41d4-a716-446655440000'::uuid) THEN
    RAISE EXCEPTION 'Failed to insert United States country';
  END IF;
END $$;

-- Step 3: Insert all 50 US states
INSERT INTO states (country_id, name, code, status)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Alabama', 'AL', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Alaska', 'AK', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Arizona', 'AZ', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Arkansas', 'AR', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'California', 'CA', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Colorado', 'CO', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Connecticut', 'CT', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Delaware', 'DE', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Florida', 'FL', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Georgia', 'GA', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Hawaii', 'HI', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Idaho', 'ID', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Illinois', 'IL', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Indiana', 'IN', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Iowa', 'IA', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Kansas', 'KS', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Kentucky', 'KY', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Louisiana', 'LA', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Maine', 'ME', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Maryland', 'MD', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Massachusetts', 'MA', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Michigan', 'MI', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Minnesota', 'MN', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Mississippi', 'MS', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Missouri', 'MO', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Montana', 'MT', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Nebraska', 'NE', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Nevada', 'NV', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'New Hampshire', 'NH', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'New Jersey', 'NJ', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'New Mexico', 'NM', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'New York', 'NY', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'North Carolina', 'NC', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'North Dakota', 'ND', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Ohio', 'OH', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Oklahoma', 'OK', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Oregon', 'OR', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Pennsylvania', 'PA', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Rhode Island', 'RI', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'South Carolina', 'SC', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'South Dakota', 'SD', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Tennessee', 'TN', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Texas', 'TX', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Utah', 'UT', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Vermont', 'VT', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Virginia', 'VA', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Washington', 'WA', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'West Virginia', 'WV', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Wisconsin', 'WI', 'active'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Wyoming', 'WY', 'active')
ON CONFLICT (country_id, name) DO NOTHING;

-- Re-enable RLS on both tables
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;

-- Create system_locations table to mark protected locations (if not exists)
CREATE TABLE IF NOT EXISTS system_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
  state_id UUID REFERENCES states(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT at_least_one_location CHECK (
    (country_id IS NOT NULL AND state_id IS NULL) OR
    (country_id IS NULL AND state_id IS NOT NULL) OR
    (country_id IS NOT NULL AND state_id IS NOT NULL)
  )
);

-- Enable RLS on system_locations
ALTER TABLE system_locations ENABLE ROW LEVEL SECURITY;

-- Disable RLS temporarily to insert system_locations data
ALTER TABLE system_locations DISABLE ROW LEVEL SECURITY;

-- Mark United States as a system location
INSERT INTO system_locations (country_id)
SELECT id FROM countries WHERE name = 'United States' AND code = 'US'
ON CONFLICT DO NOTHING;

-- Mark all US states as system locations
INSERT INTO system_locations (state_id)
SELECT id FROM states 
WHERE country_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
ON CONFLICT DO NOTHING;

-- Re-enable RLS on system_locations
ALTER TABLE system_locations ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to prevent deletion of system locations
DROP POLICY IF EXISTS "countries_delete_admin" ON countries;
DROP POLICY IF EXISTS "states_delete_admin" ON states;

-- Countries: Prevent deletion if it's a system location
CREATE POLICY "countries_delete_admin" ON countries FOR DELETE 
USING (
  is_admin() AND 
  id NOT IN (SELECT country_id FROM system_locations WHERE country_id IS NOT NULL)
);

-- States: Prevent deletion if it's a system location
CREATE POLICY "states_delete_admin" ON states FOR DELETE 
USING (
  is_admin() AND 
  id NOT IN (SELECT state_id FROM system_locations WHERE state_id IS NOT NULL)
);

-- Verify the data was inserted
SELECT 
  c.name as country,
  c.code,
  COUNT(s.id) as state_count,
  STRING_AGG(s.name, ', ' ORDER BY s.name) as states
FROM countries c
LEFT JOIN states s ON c.id = s.country_id
WHERE c.name = 'United States'
GROUP BY c.id, c.name, c.code;
