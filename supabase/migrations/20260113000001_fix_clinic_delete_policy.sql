-- Fix clinic deletion RLS policy
-- The issue is that the DELETE policy might be conflicting or not properly configured

-- First, drop all existing policies on clinics table to start fresh
DROP POLICY IF EXISTS "Clinics are viewable by everyone" ON clinics;
DROP POLICY IF EXISTS "Doctors are viewable by everyone" ON clinics;
DROP POLICY IF EXISTS "Doctors are publicly readable" ON clinics;
DROP POLICY IF EXISTS "Only admins can insert clinics" ON clinics;
DROP POLICY IF EXISTS "Only admins can update clinics" ON clinics;
DROP POLICY IF EXISTS "Only admins can delete clinics" ON clinics;
DROP POLICY IF EXISTS "Admins can insert doctors" ON clinics;
DROP POLICY IF EXISTS "Admins can update doctors" ON clinics;
DROP POLICY IF EXISTS "Admins can delete doctors" ON clinics;
DROP POLICY IF EXISTS "Admins can insert clinics" ON clinics;
DROP POLICY IF EXISTS "Admins can update clinics" ON clinics;
DROP POLICY IF EXISTS "Admins can delete clinics" ON clinics;

-- Create clean, simple policies
-- Public read access
CREATE POLICY "clinics_select_public" ON clinics
  FOR SELECT
  USING (true);

-- Admin-only INSERT
CREATE POLICY "clinics_insert_admin" ON clinics
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Admin-only UPDATE  
CREATE POLICY "clinics_update_admin" ON clinics
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Admin-only DELETE
CREATE POLICY "clinics_delete_admin" ON clinics
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Add helpful comment
COMMENT ON TABLE clinics IS 'Family practice clinics in Ontario. RLS enabled with admin-only modifications.';
