-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing users who don't have one
INSERT INTO public.profiles (user_id, email, phone_personal, display_name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'telefone', ''),
  COALESCE(au.raw_user_meta_data->>'nombre', split_part(au.email, '@', 1))
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL
ON CONFLICT (user_id) DO NOTHING;