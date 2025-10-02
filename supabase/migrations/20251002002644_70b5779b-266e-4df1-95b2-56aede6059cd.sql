-- Criar tabela accounts
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "own read" ON public.accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "own insert" ON public.accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own update" ON public.accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "own delete" ON public.accounts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar índice para melhor performance
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);