-- Create RLS policies for company_members table
-- This allows company owners to manage their employees

-- Policy 1: Company owners can view their own members
CREATE POLICY "Company owners can view their members"
ON public.company_members
FOR SELECT
USING (
  auth.uid() = company_id 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND entidad = 'empresa'
  )
);

-- Policy 2: Members can view their own data
CREATE POLICY "Members can view their own data"
ON public.company_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (phone_personal = telefono OR phone_empresa = telefono)
  )
);

-- Policy 3: Company owners can add members
CREATE POLICY "Company owners can add members"
ON public.company_members
FOR INSERT
WITH CHECK (
  auth.uid() = company_id 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND entidad = 'empresa'
  )
);

-- Policy 4: Company owners can update their members
CREATE POLICY "Company owners can update members"
ON public.company_members
FOR UPDATE
USING (
  auth.uid() = company_id 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND entidad = 'empresa'
  )
);

-- Policy 5: Company owners can delete members
CREATE POLICY "Company owners can delete members"
ON public.company_members
FOR DELETE
USING (
  auth.uid() = company_id 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND entidad = 'empresa'
  )
);