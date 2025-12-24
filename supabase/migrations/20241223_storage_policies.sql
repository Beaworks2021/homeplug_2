-- Storage Policies
-- We need to ensure that authenticated users (admins) can upload to these buckets
-- and everyone can read them.

-- Policy for product-images
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Allow authenticated uploads
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'product-images' );

-- Allow authenticated updates/deletes
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'product-images' );

CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'product-images' );


-- Policy for carousel-images
-- Allow public read access
CREATE POLICY "Public Access Carousel"
ON storage.objects FOR SELECT
USING ( bucket_id = 'carousel-images' );

-- Allow authenticated uploads
CREATE POLICY "Authenticated Upload Carousel"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'carousel-images' );

-- Allow authenticated updates/deletes
CREATE POLICY "Authenticated Update Carousel"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'carousel-images' );

CREATE POLICY "Authenticated Delete Carousel"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'carousel-images' );
