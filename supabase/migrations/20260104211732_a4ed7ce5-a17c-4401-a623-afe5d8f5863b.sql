-- Allow admins to delete community reports
CREATE POLICY "Admins can delete community reports"
ON public.community_reports
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update community reports
CREATE POLICY "Admins can update community reports"
ON public.community_reports
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete pending updates
CREATE POLICY "Admins can delete pending updates"
ON public.pending_updates
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update pending updates
CREATE POLICY "Admins can update pending updates"
ON public.pending_updates
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert pending updates (for manual operations)
CREATE POLICY "Admins can insert pending updates"
ON public.pending_updates
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));