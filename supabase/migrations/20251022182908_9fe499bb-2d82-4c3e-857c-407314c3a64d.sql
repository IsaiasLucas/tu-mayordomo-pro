-- Add nombre and tipo_cuenta columns to usuarios table
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS nombre text,
ADD COLUMN IF NOT EXISTS tipo_cuenta text DEFAULT 'personal';