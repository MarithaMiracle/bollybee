-- Create product images storage bucket (run after 001_schema.sql)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public read access for product images
CREATE POLICY "Public read product images storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Admin upload (authenticated users with admin role)
CREATE POLICY "Admin upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND is_admin()
);

CREATE POLICY "Admin delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admin update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND is_admin());
