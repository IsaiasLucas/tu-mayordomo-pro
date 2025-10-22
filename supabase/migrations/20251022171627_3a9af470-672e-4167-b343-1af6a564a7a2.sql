-- Atualizar trigger para também criar registro na tabela usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Inserir na tabela profiles
  INSERT INTO public.profiles (user_id, email, phone_personal, display_name)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'telefone', ''),
    COALESCE(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1))
  );
  
  -- Inserir na tabela usuarios
  INSERT INTO public.usuarios (user_id, telefono, plan)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'telefone', ''),
    'free'
  );
  
  RETURN new;
END;
$function$;