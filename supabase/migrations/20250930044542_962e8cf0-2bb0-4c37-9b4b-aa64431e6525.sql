-- Add student verification fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS student_email text,
ADD COLUMN IF NOT EXISTS student_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_customer_id_updated_at timestamp with time zone;