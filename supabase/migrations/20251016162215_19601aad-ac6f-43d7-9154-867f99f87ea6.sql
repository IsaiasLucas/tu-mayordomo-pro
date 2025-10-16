-- Create invitation_codes table for empresa accounts
CREATE TABLE IF NOT EXISTS public.invitation_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  empresa_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own invitation codes
CREATE POLICY "Users can view their own invitation codes"
  ON public.invitation_codes
  FOR SELECT
  USING (auth.uid() = empresa_id);

CREATE POLICY "Empresa users can create invitation codes"
  ON public.invitation_codes
  FOR INSERT
  WITH CHECK (
    auth.uid() = empresa_id 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND entidad = 'empresa'
    )
  );

CREATE POLICY "Users can delete their own invitation codes"
  ON public.invitation_codes
  FOR DELETE
  USING (auth.uid() = empresa_id);

-- Create index for faster lookups
CREATE INDEX idx_invitation_codes_empresa_id ON public.invitation_codes(empresa_id);
CREATE INDEX idx_invitation_codes_code ON public.invitation_codes(code);