-- Create trigger to automatically create profiles and usuarios records when a new user signs up
-- This trigger calls the handle_new_user function after a new user is inserted in auth.users

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();