-- Crear tabla para facturas y boletas
CREATE TABLE public.facturas_boletas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('factura', 'boleta', 'transferencia')),
  archivo_url TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL,
  archivo_tamanio INTEGER,
  fecha_documento DATE NOT NULL,
  monto NUMERIC,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices para mejorar performance
CREATE INDEX idx_facturas_boletas_user_id ON public.facturas_boletas(user_id);
CREATE INDEX idx_facturas_boletas_fecha ON public.facturas_boletas(fecha_documento DESC);
CREATE INDEX idx_facturas_boletas_account_id ON public.facturas_boletas(account_id);

-- Habilitar RLS
ALTER TABLE public.facturas_boletas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own facturas"
ON public.facturas_boletas
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own facturas"
ON public.facturas_boletas
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own facturas"
ON public.facturas_boletas
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own facturas"
ON public.facturas_boletas
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_facturas_boletas_updated_at
BEFORE UPDATE ON public.facturas_boletas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Crear bucket de storage para facturas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'facturas-boletas',
  'facturas-boletas',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
);

-- Políticas de storage para facturas
CREATE POLICY "Users can view their own facturas files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'facturas-boletas' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own facturas files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'facturas-boletas' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own facturas files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'facturas-boletas' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own facturas files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'facturas-boletas' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);