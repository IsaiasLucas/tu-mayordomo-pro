-- Crear tabla presupuestos
CREATE TABLE IF NOT EXISTS public.presupuestos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  monto_total NUMERIC NOT NULL,
  mes INTEGER NOT NULL,
  anio INTEGER NOT NULL,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para presupuestos
CREATE POLICY "Users can view their own presupuestos"
  ON public.presupuestos
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own presupuestos"
  ON public.presupuestos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presupuestos"
  ON public.presupuestos
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presupuestos"
  ON public.presupuestos
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_presupuestos_updated_at
  BEFORE UPDATE ON public.presupuestos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_presupuestos_user_mes_anio 
  ON public.presupuestos(user_id, mes, anio);