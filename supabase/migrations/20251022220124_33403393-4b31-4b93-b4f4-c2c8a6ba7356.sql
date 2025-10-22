-- Add profile_complete column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE;