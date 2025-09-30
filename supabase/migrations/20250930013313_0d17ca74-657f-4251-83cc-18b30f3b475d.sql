-- Políticas de storage para avatars
-- Permitir usuários verem avatars públicos
CREATE POLICY "Avatars são visíveis publicamente"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Permitir usuários fazerem upload de seus próprios avatars
CREATE POLICY "Usuários podem fazer upload de seus avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir usuários atualizarem seus próprios avatars
CREATE POLICY "Usuários podem atualizar seus avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir usuários excluírem seus próprios avatars
CREATE POLICY "Usuários podem excluir seus avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);