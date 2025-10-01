-- Enable RLS on gastos table
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert their own gastos
CREATE POLICY "Users can insert their own gastos"
ON public.gastos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow users to view gastos data
CREATE POLICY "Users can view gastos data"
ON public.gastos
FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow users to update their own gastos
CREATE POLICY "Users can update gastos data"
ON public.gastos
FOR UPDATE
TO authenticated
USING (true);

-- Create policy to allow users to delete their own gastos
CREATE POLICY "Users can delete gastos data"
ON public.gastos
FOR DELETE
TO authenticated
USING (true);