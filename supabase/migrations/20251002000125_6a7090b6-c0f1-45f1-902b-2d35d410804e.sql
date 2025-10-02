-- Verificar e criar políticas RLS para o bucket avatars

-- Permitir que usuários façam upload de seus próprios avatares
CREATE POLICY "Usuários podem fazer upload de seus avatares"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que usuários atualizem seus próprios avatares
CREATE POLICY "Usuários podem atualizar seus avatares"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que usuários excluam seus próprios avatares
CREATE POLICY "Usuários podem excluir seus avatares"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que todos vejam avatares (bucket público)
CREATE POLICY "Avatares são públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');