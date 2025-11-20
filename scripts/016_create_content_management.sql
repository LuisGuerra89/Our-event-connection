-- Content Management table for CMS pages
CREATE TABLE IF NOT EXISTS cms_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "cms_content_select_all" ON cms_content FOR SELECT USING (true);
CREATE POLICY "cms_content_insert_admin" ON cms_content FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "cms_content_update_admin" ON cms_content FOR UPDATE USING (is_admin());
CREATE POLICY "cms_content_delete_admin" ON cms_content FOR DELETE USING (is_admin());

-- Insert default pages
INSERT INTO cms_content (page_key, title, content) VALUES
  ('about_us', 'About Us', 'Welcome to our event platform...'),
  ('how_it_works', 'How It Works', 'Step-by-step guide...'),
  ('terms_conditions', 'Terms and Conditions', 'Terms and conditions content...'),
  ('privacy_policy', 'Privacy Policy', 'Privacy policy content...'),
  ('faq', 'Frequently Asked Questions', 'FAQ content...')
ON CONFLICT (page_key) DO NOTHING;
