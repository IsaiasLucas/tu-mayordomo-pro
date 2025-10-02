-- Atualizar registros existentes em gastos para vincular ao user_id correto
-- Compara o telefono da tabela gastos com phone_personal e phone_empresa da tabela profiles
UPDATE gastos g
SET user_id = p.user_id
FROM profiles p
WHERE g.user_id IS NULL
  AND (
    -- Remove todos os caracteres não numéricos para comparar
    regexp_replace(g.telefono, '[^0-9]', '', 'g') = regexp_replace(p.phone_personal, '[^0-9]', '', 'g')
    OR
    regexp_replace(g.telefono, '[^0-9]', '', 'g') = regexp_replace(p.phone_empresa, '[^0-9]', '', 'g')
  );

-- Criar trigger para garantir que novos registros sempre tenham user_id
-- Caso o user_id não seja fornecido, tenta preencher baseado no telefono
CREATE OR REPLACE FUNCTION public.set_gastos_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se user_id já está preenchido, não faz nada
  IF NEW.user_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Se auth.uid() está disponível, usa ele
  IF auth.uid() IS NOT NULL THEN
    NEW.user_id := auth.uid();
    RETURN NEW;
  END IF;
  
  -- Se não, tenta encontrar pelo telefone
  IF NEW.telefono IS NOT NULL THEN
    SELECT p.user_id INTO NEW.user_id
    FROM profiles p
    WHERE regexp_replace(NEW.telefono, '[^0-9]', '', 'g') = regexp_replace(p.phone_personal, '[^0-9]', '', 'g')
       OR regexp_replace(NEW.telefono, '[^0-9]', '', 'g') = regexp_replace(p.phone_empresa, '[^0-9]', '', 'g')
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger na tabela gastos
DROP TRIGGER IF EXISTS set_gastos_user_id_trigger ON public.gastos;
CREATE TRIGGER set_gastos_user_id_trigger
  BEFORE INSERT OR UPDATE ON public.gastos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_gastos_user_id();