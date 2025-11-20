-- Add new columns to events table for enhanced features
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS registration_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS registration_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS venue_type TEXT,
ADD COLUMN IF NOT EXISTS gender_limitation TEXT,
ADD COLUMN IF NOT EXISTS age_min INTEGER,
ADD COLUMN IF NOT EXISTS age_max INTEGER,
ADD COLUMN IF NOT EXISTS event_logo_url TEXT,
ADD COLUMN IF NOT EXISTS refund_policy TEXT,
ADD COLUMN IF NOT EXISTS subscription_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS event_images JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS event_videos JSONB DEFAULT '[]';

-- Add comment
COMMENT ON COLUMN events.event_images IS 'Array of image URLs for event banner/gallery';
COMMENT ON COLUMN events.event_videos IS 'Array of video URLs for past events';
