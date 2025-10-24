-- Drop the current restrictive policy
DROP POLICY IF EXISTS "Gastos select own" ON public.gastos;

-- Create new policy that allows SELECT by user_id OR by matching phone
CREATE POLICY "Gastos select own or by phone" ON public.gastos
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND (
        regexp_replace(gastos.telefono, '[^0-9]', '', 'g') = regexp_replace(profiles.phone_personal, '[^0-9]', '', 'g')
        OR 
        regexp_replace(gastos.telefono, '[^0-9]', '', 'g') = regexp_replace(profiles.phone_empresa, '[^0-9]', '', 'g')
      )
    )
  );