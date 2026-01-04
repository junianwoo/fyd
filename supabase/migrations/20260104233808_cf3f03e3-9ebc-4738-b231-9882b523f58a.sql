-- Add CPSO number column to doctors table
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS cpso_number text UNIQUE;

-- Create an index for faster lookups by CPSO number
CREATE INDEX IF NOT EXISTS idx_doctors_cpso_number ON public.doctors (cpso_number);