-- Event Categories table
CREATE TABLE IF NOT EXISTS event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Category mapping (many-to-many)
CREATE TABLE IF NOT EXISTS event_category_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  category_id UUID REFERENCES event_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, category_id)
);

-- Enable RLS
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_category_mapping ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "event_categories_select_all" ON event_categories FOR SELECT USING (true);
CREATE POLICY "event_categories_insert_admin" ON event_categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "event_categories_update_admin" ON event_categories FOR UPDATE USING (is_admin());
CREATE POLICY "event_categories_delete_admin" ON event_categories FOR DELETE USING (is_admin());

CREATE POLICY "event_category_mapping_select_all" ON event_category_mapping FOR SELECT USING (true);
CREATE POLICY "event_category_mapping_insert_admin" ON event_category_mapping FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "event_category_mapping_delete_admin" ON event_category_mapping FOR DELETE USING (is_admin());

-- Indexes
CREATE INDEX idx_event_category_mapping_event_id ON event_category_mapping(event_id);
CREATE INDEX idx_event_category_mapping_category_id ON event_category_mapping(category_id);
