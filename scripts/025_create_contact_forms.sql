-- Contact Form submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "contact_submissions_insert_all" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_select_admin" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_update_admin" ON contact_submissions;

CREATE POLICY "contact_submissions_insert_all" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_submissions_select_admin" ON contact_submissions FOR SELECT USING (is_admin());
CREATE POLICY "contact_submissions_update_admin" ON contact_submissions FOR UPDATE USING (is_admin());

-- Indexes
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
