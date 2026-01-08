-- Add admin policies for doctors table
-- This allows admins to update doctors when approving community reports

-- Allow admins to update doctors (including all fields like community_report_count)
CREATE POLICY "Admins can update doctors"
ON public.doctors
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert doctors
CREATE POLICY "Admins can insert doctors"
ON public.doctors
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete doctors (for cleanup operations)
CREATE POLICY "Admins can delete doctors"
ON public.doctors
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
