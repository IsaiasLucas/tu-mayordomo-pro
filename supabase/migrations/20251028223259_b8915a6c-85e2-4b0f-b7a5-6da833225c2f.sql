-- Enable realtime for gastos table
ALTER TABLE public.gastos REPLICA IDENTITY FULL;

-- Add gastos to supabase_realtime publication if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'gastos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gastos;
  END IF;
END $$;