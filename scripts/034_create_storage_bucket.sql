-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'events',
  'events',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for event images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own event images" ON storage.objects;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'events' );

CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'events' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own event images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'events' AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'events' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own event images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'events' AND
  auth.role() = 'authenticated'
);
