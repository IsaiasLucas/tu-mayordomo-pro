-- Fix handle_new_user to ensure profile is created without default phone values
-- This ensures CompleteProfileModal will be shown for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Insert into profiles with NULL phone values to ensure modal shows
  INSERT INTO public.profiles (user_id, email, phone_personal, display_name, whatsapp_configured)
  VALUES (
    new.id, 
    new.email,
    NULL,  -- Changed from empty string to NULL
    COALESCE(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    false  -- Explicitly set to false
  );
  
  -- Insert into usuarios with empty phone
  INSERT INTO public.usuarios (user_id, telefono, plan)
  VALUES (
    new.id,
    '',
    'free'
  );
  
  RETURN new;
END;
$function$;