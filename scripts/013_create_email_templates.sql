-- Email Templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipients table
CREATE TABLE IF NOT EXISTS email_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_recipients ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "email_templates_select_admin" ON email_templates FOR SELECT USING (is_admin());
CREATE POLICY "email_templates_update_admin" ON email_templates FOR UPDATE USING (is_admin());
CREATE POLICY "email_templates_insert_admin" ON email_templates FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "email_recipients_select_admin" ON email_recipients FOR SELECT USING (is_admin());
CREATE POLICY "email_recipients_insert_admin" ON email_recipients FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "email_recipients_update_admin" ON email_recipients FOR UPDATE USING (is_admin());
CREATE POLICY "email_recipients_delete_admin" ON email_recipients FOR DELETE USING (is_admin());

-- Indexes
CREATE INDEX idx_email_recipients_template_id ON email_recipients(email_template_id);
CREATE INDEX idx_email_recipients_email ON email_recipients(email);
