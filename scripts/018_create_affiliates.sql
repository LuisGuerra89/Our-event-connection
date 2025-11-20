-- Affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT,
  barcode TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "affiliates_select_all" ON affiliates;
DROP POLICY IF EXISTS "affiliates_insert_admin" ON affiliates;
DROP POLICY IF EXISTS "affiliates_update_admin" ON affiliates;
DROP POLICY IF EXISTS "affiliates_delete_admin" ON affiliates;

-- Policies
CREATE POLICY "affiliates_select_all" ON affiliates FOR SELECT USING (true);
CREATE POLICY "affiliates_insert_admin" ON affiliates FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "affiliates_update_admin" ON affiliates FOR UPDATE USING (is_admin());
CREATE POLICY "affiliates_delete_admin" ON affiliates FOR DELETE USING (is_admin());
