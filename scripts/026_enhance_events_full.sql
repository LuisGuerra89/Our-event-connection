-- Add missing fields to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS venue_type text,
ADD COLUMN IF NOT EXISTS country_id uuid REFERENCES public.countries(id),
ADD COLUMN IF NOT EXISTS state_id uuid REFERENCES public.states(id),
ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES public.cities(id),
ADD COLUMN IF NOT EXISTS gender_limitation text CHECK (gender_limitation IN ('male_only', 'female_only', 'mixed', 'no_limitation')),
ADD COLUMN IF NOT EXISTS min_age integer,
ADD COLUMN IF NOT EXISTS max_age integer,
ADD COLUMN IF NOT EXISTS registration_start_date timestamptz,
ADD COLUMN IF NOT EXISTS registration_end_date timestamptz,
ADD COLUMN IF NOT EXISTS banner_images text[], -- Array of image URLs
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS refund_policy text,
ADD COLUMN IF NOT EXISTS subscription_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.event_categories(id),
ADD COLUMN IF NOT EXISTS notification_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_enabled boolean DEFAULT true;

-- Create event photos table for past event galleries
CREATE TABLE IF NOT EXISTS public.event_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  photo_type text CHECK (photo_type IN ('photo', 'video')),
  caption text,
  display_order integer DEFAULT 0,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_photos
CREATE POLICY "event_photos_select_all"
  ON public.event_photos FOR SELECT
  USING (true);

CREATE POLICY "event_photos_insert_admin"
  ON public.event_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "event_photos_update_admin"
  ON public.event_photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "event_photos_delete_admin"
  ON public.event_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS event_photos_event_id_idx ON public.event_photos(event_id);
CREATE INDEX IF NOT EXISTS event_photos_display_order_idx ON public.event_photos(display_order);
