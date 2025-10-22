-- Add profile_complete column to usuarios table
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS profile_complete boolean DEFAULT false;

-- Update existing rows where telefono is set to mark profile as complete
UPDATE public.usuarios 
SET profile_complete = true 
WHERE telefono IS NOT NULL AND telefono != '';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_usuarios_profile_complete 
ON public.usuarios(user_id, profile_complete);