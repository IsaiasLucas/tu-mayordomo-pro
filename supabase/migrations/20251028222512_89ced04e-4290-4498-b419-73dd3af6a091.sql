-- Enable realtime for facturas_boletas and reportes
-- Ensure full row data is published
ALTER TABLE public.facturas_boletas REPLICA IDENTITY FULL;
ALTER TABLE public.reportes REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'facturas_boletas'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.facturas_boletas;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'reportes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reportes;
  END IF;
END $$;