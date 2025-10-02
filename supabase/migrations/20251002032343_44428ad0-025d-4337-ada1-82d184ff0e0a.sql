-- Fix user_id backfill for gastos table
-- The phone formats differ between tables, so we need to normalize them properly

UPDATE public.gastos g
SET user_id = (
  SELECT p.user_id 
  FROM public.profiles p 
  WHERE regexp_replace(p.phone_personal, '[^0-9]', '', 'g') = regexp_replace(g.telefono, '[^0-9]', '', 'g')
  LIMIT 1
)
WHERE g.user_id IS NULL;

-- Do the same for usuarios table
UPDATE public.usuarios u
SET user_id = (
  SELECT p.user_id 
  FROM public.profiles p 
  WHERE regexp_replace(p.phone_personal, '[^0-9]', '', 'g') = regexp_replace(u.telefono, '[^0-9]', '', 'g')
  LIMIT 1
)
WHERE u.user_id IS NULL;