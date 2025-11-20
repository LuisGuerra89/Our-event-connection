-- Enums table for managing dropdown values
CREATE TABLE IF NOT EXISTS enums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enum_type TEXT NOT NULL,
  enum_title TEXT NOT NULL,
  parent_type TEXT,
  parent_value TEXT,
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enum_type, enum_title)
);

-- Enable RLS
ALTER TABLE enums ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "enums_select_all" ON enums FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "enums_insert_admin" ON enums FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "enums_update_admin" ON enums FOR UPDATE USING (is_admin());
CREATE POLICY "enums_delete_admin" ON enums FOR DELETE USING (is_admin());

-- Indexes
CREATE INDEX idx_enums_type ON enums(enum_type);
CREATE INDEX idx_enums_parent ON enums(parent_type, parent_value);

-- Insert default enum values
INSERT INTO enums (enum_type, enum_title, display_order) VALUES
  ('skin_tone', 'Fair', 1),
  ('skin_tone', 'Medium', 2),
  ('skin_tone', 'Olive', 3),
  ('skin_tone', 'Brown', 4),
  ('skin_tone', 'Dark', 5),
  ('hair_color', 'Blonde', 1),
  ('hair_color', 'Brown', 2),
  ('hair_color', 'Black', 3),
  ('hair_color', 'Red', 4),
  ('hair_color', 'Gray', 5),
  ('occupation', 'Professional', 1),
  ('occupation', 'Business Owner', 2),
  ('occupation', 'Student', 3),
  ('occupation', 'Other', 4),
  ('venue_type', 'Restaurant', 1),
  ('venue_type', 'Bar', 2),
  ('venue_type', 'Club', 3),
  ('venue_type', 'Outdoor', 4),
  ('venue_type', 'Virtual', 5),
  ('event_type', 'Speed Dating', 1),
  ('event_type', 'Social Mixer', 2),
  ('event_type', 'Activity', 3),
  ('event_type', 'Workshop', 4)
ON CONFLICT (enum_type, enum_title) DO NOTHING;
