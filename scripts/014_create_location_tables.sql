-- Countries table
CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- States table
CREATE TABLE IF NOT EXISTS states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_id, name)
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID REFERENCES states(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(state_id, name)
);

-- Enable RLS
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Policies (allow read for all authenticated users, write for admins)
DROP POLICY IF EXISTS "countries_select_all" ON countries;
DROP POLICY IF EXISTS "countries_insert_admin" ON countries;
DROP POLICY IF EXISTS "countries_update_admin" ON countries;
DROP POLICY IF EXISTS "countries_delete_admin" ON countries;
DROP POLICY IF EXISTS "states_select_all" ON states;
DROP POLICY IF EXISTS "states_insert_admin" ON states;
DROP POLICY IF EXISTS "states_update_admin" ON states;
DROP POLICY IF EXISTS "states_delete_admin" ON states;
DROP POLICY IF EXISTS "cities_select_all" ON cities;
DROP POLICY IF EXISTS "cities_insert_admin" ON cities;
DROP POLICY IF EXISTS "cities_update_admin" ON cities;
DROP POLICY IF EXISTS "cities_delete_admin" ON cities;

CREATE POLICY "countries_select_all" ON countries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "countries_insert_admin" ON countries FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "countries_update_admin" ON countries FOR UPDATE USING (is_admin());
CREATE POLICY "countries_delete_admin" ON countries FOR DELETE USING (is_admin());

CREATE POLICY "states_select_all" ON states FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "states_insert_admin" ON states FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "states_update_admin" ON states FOR UPDATE USING (is_admin());
CREATE POLICY "states_delete_admin" ON states FOR DELETE USING (is_admin());

CREATE POLICY "cities_select_all" ON cities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "cities_insert_admin" ON cities FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "cities_update_admin" ON cities FOR UPDATE USING (is_admin());
CREATE POLICY "cities_delete_admin" ON cities FOR DELETE USING (is_admin());

-- Indexes
CREATE INDEX idx_states_country_id ON states(country_id);
CREATE INDEX idx_cities_state_id ON cities(state_id);
