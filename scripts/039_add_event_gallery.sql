-- Add gallery columns to events table for photos and videos from past events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS gallery_photos JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS gallery_videos JSONB DEFAULT '[]'::jsonb;

-- Add comments
COMMENT ON COLUMN public.events.gallery_photos IS 'Array of photo URLs for past event gallery (e.g., ["https://...", "https://..."])';
COMMENT ON COLUMN public.events.gallery_videos IS 'Array of video URLs for past event gallery (e.g., ["https://...", "https://..."])';

-- Example: Add sample gallery data to a past event (update with actual event IDs)
-- UPDATE public.events
-- SET 
--   gallery_photos = '["https://example.com/photo1.jpg", "https://example.com/photo2.jpg", "https://example.com/photo3.jpg"]'::jsonb,
--   gallery_videos = '["https://example.com/video1.mp4"]'::jsonb
-- WHERE id = 'your-event-id-here' AND end_date < NOW();
