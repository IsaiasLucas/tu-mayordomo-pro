-- Drop triggers and functions that automatically create usuarios records during signup
-- This prevents duplicate key errors when phone is not provided during signup

-- First, drop ALL triggers that depend on these functions
DROP TRIGGER IF EXISTS on_auth_user_created_usuarios ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_signup ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now drop the functions with CASCADE to ensure all dependencies are removed
DROP FUNCTION IF EXISTS public.handle_new_user_usuarios() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_signup() CASCADE;

-- The handle_new_user function and trigger will remain to create the profiles record
-- But usuarios records will only be created when users complete their profile
-- via the CompleteProfileModal, avoiding duplicate phone conflicts