-- Add whatsapp_configured field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp_configured boolean DEFAULT false;

-- Update existing users to have whatsapp_configured as false
UPDATE public.profiles 
SET whatsapp_configured = false 
WHERE whatsapp_configured IS NULL;