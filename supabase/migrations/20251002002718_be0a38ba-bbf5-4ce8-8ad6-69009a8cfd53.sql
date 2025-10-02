-- Adicionar account_id nas tabelas existentes
ALTER TABLE public.gastos ADD COLUMN account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.reportes ADD COLUMN account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE public.entities ADD COLUMN account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;

-- Criar índices para melhor performance
CREATE INDEX idx_gastos_account_id ON public.gastos(account_id);
CREATE INDEX idx_reportes_account_id ON public.reportes(account_id);
CREATE INDEX idx_entities_account_id ON public.entities(account_id);