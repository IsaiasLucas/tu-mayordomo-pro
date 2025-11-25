-- Remove unique constraint from usuarios.telefono
-- This allows multiple users to have empty phone numbers until they complete their profile
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_telefono_key;

-- Add a comment explaining why this field is not unique
COMMENT ON COLUMN usuarios.telefono IS 'Phone number - can be empty until profile completion. Not unique to allow multiple users with empty values.';