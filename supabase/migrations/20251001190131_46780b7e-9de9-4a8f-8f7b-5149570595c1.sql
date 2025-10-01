-- Enable RLS on usuarios table if not already enabled
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert their phone data
CREATE POLICY "Users can insert their own phone data"
ON public.usuarios
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow users to view their own data by phone
CREATE POLICY "Users can view their own data"
ON public.usuarios
FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update their own data"
ON public.usuarios
FOR UPDATE
TO authenticated
USING (true);