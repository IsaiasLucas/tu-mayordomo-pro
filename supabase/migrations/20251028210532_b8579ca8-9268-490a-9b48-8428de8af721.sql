-- Tornar o bucket facturas-boletas público
UPDATE storage.buckets 
SET public = true 
WHERE name = 'facturas-boletas';

-- Criar política para permitir visualização dos próprios arquivos
CREATE POLICY "Users can view their own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'facturas-boletas' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Criar política para upload dos próprios arquivos
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'facturas-boletas' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Criar política para atualizar os próprios arquivos
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'facturas-boletas' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Criar política para deletar os próprios arquivos
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'facturas-boletas' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);