-- Create function to handle new user signup and insert into usuarios table
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into usuarios table with phone from metadata
  INSERT INTO public.usuarios (
    user_id,
    telefono,
    plan,
    reporte_semanal,
    reporte_mensual,
    created_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'free',
    true,
    true,
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If phone already exists, try to update the record
    UPDATE public.usuarios
    SET user_id = NEW.id
    WHERE telefono = COALESCE(NEW.raw_user_meta_data->>'phone', '')
    AND user_id IS NULL;
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating user record: %', SQLERRM;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to call function after user insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();