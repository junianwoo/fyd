-- Migration: Rename doctors table to clinics and update schema
-- This migration transforms the platform from doctor-focused to clinic-focused

-- Step 1: Rename the doctors table to clinics
ALTER TABLE doctors RENAME TO clinics;

-- Step 2: Drop doctor-specific columns
ALTER TABLE clinics DROP COLUMN IF EXISTS full_name;
ALTER TABLE clinics DROP COLUMN IF EXISTS cpso_number;

-- Step 3: Rename clinic_name to name (primary identifier)
ALTER TABLE clinics RENAME COLUMN clinic_name TO name;

-- Step 4: Rename claimed_by_doctor to claimed_by_clinic
ALTER TABLE clinics RENAME COLUMN claimed_by_doctor TO claimed_by_clinic;

-- Step 5: Update community_reports table
ALTER TABLE community_reports RENAME COLUMN doctor_id TO clinic_id;

-- Step 6: Drop old foreign key constraint and create new one for community_reports
ALTER TABLE community_reports DROP CONSTRAINT IF EXISTS community_reports_doctor_id_fkey;
ALTER TABLE community_reports ADD CONSTRAINT community_reports_clinic_id_fkey 
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;

-- Step 7: Update pending_updates table
ALTER TABLE pending_updates RENAME COLUMN doctor_id TO clinic_id;

-- Step 8: Drop old foreign key constraint and create new one for pending_updates
ALTER TABLE pending_updates DROP CONSTRAINT IF EXISTS pending_updates_doctor_id_fkey;
ALTER TABLE pending_updates ADD CONSTRAINT pending_updates_clinic_id_fkey 
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;

-- Step 9: Update verification_tokens table
ALTER TABLE verification_tokens RENAME COLUMN doctor_id TO clinic_id;

-- Step 10: Drop old foreign key constraint and create new one for verification_tokens
ALTER TABLE verification_tokens DROP CONSTRAINT IF EXISTS verification_tokens_doctor_id_fkey;
ALTER TABLE verification_tokens ADD CONSTRAINT verification_tokens_clinic_id_fkey 
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;

-- Step 11: Create indexes for improved search performance
CREATE INDEX IF NOT EXISTS idx_clinics_city ON clinics(city);
CREATE INDEX IF NOT EXISTS idx_clinics_postal_code ON clinics(postal_code);
CREATE INDEX IF NOT EXISTS idx_clinics_accepting_status ON clinics(accepting_status);
CREATE INDEX IF NOT EXISTS idx_clinics_location ON clinics USING gist (
  point(longitude, latitude)
);

-- Step 12: Update RLS policies (rename policies that reference doctors)
-- Drop old policies
DROP POLICY IF EXISTS "Doctors are viewable by everyone" ON clinics;
DROP POLICY IF EXISTS "Only admins can insert doctors" ON clinics;
DROP POLICY IF EXISTS "Only admins can update doctors" ON clinics;
DROP POLICY IF EXISTS "Only admins can delete doctors" ON clinics;

-- Create new policies with updated names
CREATE POLICY "Clinics are viewable by everyone" ON clinics
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert clinics" ON clinics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update clinics" ON clinics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete clinics" ON clinics
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Step 13: Add comment to table for documentation
COMMENT ON TABLE clinics IS 'Family practice clinics in Ontario. Formerly known as doctors table. Contains clinic information including name, location, accepting status, and contact details.';
COMMENT ON COLUMN clinics.name IS 'Clinic name (formerly clinic_name)';
COMMENT ON COLUMN clinics.claimed_by_clinic IS 'Whether this clinic has been claimed by clinic staff (formerly claimed_by_doctor)';
