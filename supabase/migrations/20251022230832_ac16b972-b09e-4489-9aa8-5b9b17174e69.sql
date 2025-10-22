-- Criar políticas RLS para o bucket facturas-boletas

-- Permitir aos usuários ver seus próprios arquivos
CREATE POLICY "Users can view their own facturas"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'facturas-boletas' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir aos usuários fazer upload de seus próprios arquivos
CREATE POLICY "Users can upload their own facturas"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'facturas-boletas' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir aos usuários atualizar seus próprios arquivos
CREATE POLICY "Users can update their own facturas"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'facturas-boletas' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir aos usuários deletar seus próprios arquivos
CREATE POLICY "Users can delete their own facturas"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'facturas-boletas' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);