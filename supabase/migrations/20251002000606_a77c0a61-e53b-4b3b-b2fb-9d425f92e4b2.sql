-- Fix storage RLS for avatars: ensure UPDATE upserts are allowed with WITH CHECK

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Usuários podem fazer upload de seus avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem excluir seus avatares" ON storage.objects;
DROP POLICY IF EXISTS "Avatares são públicos" ON storage.objects;

-- Allow users to upload their own avatars (path must start with their user id)
CREATE POLICY "Usuários podem fazer upload de seus avatares"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatars (covers upsert case)
CREATE POLICY "Usuários podem atualizar seus avatares"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatars
CREATE POLICY "Usuários podem excluir seus avatares"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Make avatars publicly readable
CREATE POLICY "Avatares são públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');