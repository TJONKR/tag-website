-- Allow authenticated users to insert their own contracts
CREATE POLICY "Users can insert own contracts"
  ON contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to upload to contracts storage bucket
CREATE POLICY "Users can upload own contracts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'contracts'
    AND (storage.foldername(name))[1] = 'contracts'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow authenticated users to read their own contract files
CREATE POLICY "Users can read own contract files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'contracts'
    AND (storage.foldername(name))[1] = 'contracts'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
