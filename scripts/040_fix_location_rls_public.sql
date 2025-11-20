-- Update RLS policies to allow public read access to location tables
-- This allows the homepage and public pages to display location filters

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "countries_select_all" ON countries;
DROP POLICY IF EXISTS "states_select_all" ON states;
DROP POLICY IF EXISTS "cities_select_all" ON cities;

-- Create new public SELECT policies
CREATE POLICY "countries_select_public" ON countries 
  FOR SELECT 
  USING (true);

CREATE POLICY "states_select_public" ON states 
  FOR SELECT 
  USING (true);

CREATE POLICY "cities_select_public" ON cities 
  FOR SELECT 
  USING (true);

-- Keep admin-only write policies (already exist, no changes needed)
-- countries_insert_admin, countries_update_admin, countries_delete_admin
-- states_insert_admin, states_update_admin, states_delete_admin
-- cities_insert_admin, cities_update_admin, cities_delete_admin
