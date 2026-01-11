-- Make full_name optional since we're pivoting to clinic-only data
-- New data won't have doctor names, only clinic names

ALTER TABLE public.doctors 
ALTER COLUMN full_name DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN public.doctors.full_name IS 'Optional doctor/provider name. For clinic-only data, this may be NULL or same as clinic_name.';
