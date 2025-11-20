-- Add is_featured column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS events_is_featured_idx ON public.events(is_featured) WHERE is_featured = true;

-- Update some events to be featured (optional - for demo purposes)
-- You can manually set events as featured in the admin panel
