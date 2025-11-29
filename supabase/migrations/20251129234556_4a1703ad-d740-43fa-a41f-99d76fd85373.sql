-- Function to automatically enable whatsapp_configured when first message is received
CREATE OR REPLACE FUNCTION auto_enable_whatsapp_on_first_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profiles where phone matches and whatsapp_configured is false
  -- This activates opt-in automatically on first message
  UPDATE public.profiles
  SET 
    whatsapp_configured = true,
    updated_at = now()
  WHERE 
    whatsapp_configured = false
    AND (
      regexp_replace(phone_personal, '[^0-9]', '', 'g') = regexp_replace(NEW.telefono, '[^0-9]', '', 'g')
      OR regexp_replace(phone_empresa, '[^0-9]', '', 'g') = regexp_replace(NEW.telefono, '[^0-9]', '', 'g')
    );
  
  -- Also update usuarios table if needed
  UPDATE public.usuarios
  SET profile_complete = true
  WHERE 
    profile_complete = false
    AND regexp_replace(telefono, '[^0-9]', '', 'g') = regexp_replace(NEW.telefono, '[^0-9]', '', 'g');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires AFTER INSERT on gastos table
DROP TRIGGER IF EXISTS trigger_auto_enable_whatsapp ON public.gastos;
CREATE TRIGGER trigger_auto_enable_whatsapp
  AFTER INSERT ON public.gastos
  FOR EACH ROW
  EXECUTE FUNCTION auto_enable_whatsapp_on_first_message();

-- Add helpful comment
COMMENT ON FUNCTION auto_enable_whatsapp_on_first_message() IS 'Automatically enables whatsapp_configured when user sends their first message (creates first gasto record). This activates opt-in automatically.';