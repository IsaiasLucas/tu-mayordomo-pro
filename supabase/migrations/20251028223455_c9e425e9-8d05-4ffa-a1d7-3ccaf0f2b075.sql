-- Add telefono column to facturas_boletas if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'facturas_boletas' 
    AND column_name = 'telefono'
  ) THEN
    ALTER TABLE public.facturas_boletas ADD COLUMN telefono text;
  END IF;
END $$;