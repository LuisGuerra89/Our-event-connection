-- Add suggest_event column to contact_submissions table
ALTER TABLE contact_submissions ADD COLUMN suggest_event BOOLEAN DEFAULT false;

-- Add comment for the column
COMMENT ON COLUMN contact_submissions.suggest_event IS 'Whether the user is suggesting a future event idea';

-- Create index for filtering event suggestions
CREATE INDEX idx_contact_submissions_suggest_event ON contact_submissions(suggest_event) WHERE suggest_event = true;
