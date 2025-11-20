-- Site Settings table for SMTP and other configurations
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'text',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "site_settings_select_admin" ON site_settings;
DROP POLICY IF EXISTS "site_settings_update_admin" ON site_settings;
DROP POLICY IF EXISTS "site_settings_insert_admin" ON site_settings;

CREATE POLICY "site_settings_select_admin" ON site_settings FOR SELECT USING (is_admin());
CREATE POLICY "site_settings_update_admin" ON site_settings FOR UPDATE USING (is_admin());
CREATE POLICY "site_settings_insert_admin" ON site_settings FOR INSERT WITH CHECK (is_admin());

-- Insert default SMTP settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
  ('smtp_server', '', 'text', 'SMTP Server Address'),
  ('smtp_email', '', 'email', 'SMTP Email Address'),
  ('smtp_password', '', 'password', 'SMTP Password'),
  ('smtp_ssl', 'true', 'boolean', 'Use SSL for SMTP'),
  ('site_url', '', 'url', 'Site URL')
ON CONFLICT (setting_key) DO NOTHING;
