-- Add country and currency fields to profiles table
ALTER TABLE profiles 
ADD COLUMN country TEXT DEFAULT 'CL',
ADD COLUMN currency TEXT DEFAULT 'CLP';

-- Add country and currency fields to usuarios table for backward compatibility
ALTER TABLE usuarios
ADD COLUMN country TEXT DEFAULT 'CL',
ADD COLUMN currency TEXT DEFAULT 'CLP';

-- Add comment to explain the fields
COMMENT ON COLUMN profiles.country IS 'ISO country code (e.g., CL, MX, AR, ES, US)';
COMMENT ON COLUMN profiles.currency IS 'Currency code (e.g., CLP, MXN, ARS, EUR, USD)';
COMMENT ON COLUMN usuarios.country IS 'ISO country code (e.g., CL, MX, AR, ES, US)';
COMMENT ON COLUMN usuarios.currency IS 'Currency code (e.g., CLP, MXN, ARS, EUR, USD)';