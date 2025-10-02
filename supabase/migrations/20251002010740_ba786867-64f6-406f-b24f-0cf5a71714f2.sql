-- Create storage bucket for account avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('account-avatars', 'account-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for account-avatars bucket
CREATE POLICY "Users can upload their own account avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'account-avatars' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM accounts WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view account avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'account-avatars');

CREATE POLICY "Users can update their own account avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'account-avatars'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM accounts WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own account avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'account-avatars'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM accounts WHERE user_id = auth.uid()
  )
);