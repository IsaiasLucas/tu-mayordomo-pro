-- Crear tabla metas
CREATE TABLE IF NOT EXISTS public.metas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nombre_meta TEXT NOT NULL,
  monto_objetivo NUMERIC NOT NULL,
  monto_actual NUMERIC NOT NULL DEFAULT 0,
  fecha_limite DATE,
  estado TEXT NOT NULL DEFAULT 'activo',
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para metas
CREATE POLICY "Users can view their own metas"
  ON public.metas
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own metas"
  ON public.metas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metas"
  ON public.metas
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metas"
  ON public.metas
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_metas_updated_at
  BEFORE UPDATE ON public.metas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_metas_user_id 
  ON public.metas(user_id);