-- Create storage bucket for affiliate images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'affiliates',
  'affiliates',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for affiliate images
DROP POLICY IF EXISTS "Public Access Affiliates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload affiliate images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update affiliate images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete affiliate images" ON storage.objects;

CREATE POLICY "Public Access Affiliates"
ON storage.objects FOR SELECT
USING ( bucket_id = 'affiliates' );

CREATE POLICY "Authenticated users can upload affiliate images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'affiliates' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Admins can update affiliate images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'affiliates' AND
  (auth.role() = 'authenticated' OR is_admin())
)
WITH CHECK (
  bucket_id = 'affiliates' AND
  (auth.role() = 'authenticated' OR is_admin())
);

CREATE POLICY "Admins can delete affiliate images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'affiliates' AND
  is_admin()
);
