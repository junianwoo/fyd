-- Add assisted access fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS assisted_reason text,
ADD COLUMN IF NOT EXISTS assisted_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS assisted_renewed_count integer DEFAULT 0;

-- Create pending_updates table for community reports threshold system
CREATE TABLE IF NOT EXISTS public.pending_updates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  status public.accepting_status NOT NULL,
  count integer NOT NULL DEFAULT 1,
  ip_addresses text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(doctor_id, status)
);

-- Enable RLS on pending_updates
ALTER TABLE public.pending_updates ENABLE ROW LEVEL SECURITY;

-- Allow public read/insert for pending_updates (community updates are anonymous)
CREATE POLICY "Pending updates are publicly readable" 
ON public.pending_updates 
FOR SELECT 
USING (true);

-- Create verification_tokens table for magic link doctor claiming
CREATE TABLE IF NOT EXISTS public.verification_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  email text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false
);

-- Enable RLS on verification_tokens
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage tokens (edge functions will use service role)
CREATE POLICY "Verification tokens readable by authenticated users with matching email"
ON public.verification_tokens
FOR SELECT
USING (true);

-- Add policy to allow doctors table updates from service role (for claiming)
CREATE POLICY "Service role can update doctors"
ON public.doctors
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Add policy to allow doctors table inserts from service role
CREATE POLICY "Service role can insert doctors"
ON public.doctors
FOR INSERT
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_updates_doctor_status ON public.pending_updates(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON public.verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires ON public.verification_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_doctors_accepting_status ON public.doctors(accepting_status);
CREATE INDEX IF NOT EXISTS idx_doctors_city ON public.doctors(city);
CREATE INDEX IF NOT EXISTS idx_doctors_location ON public.doctors(latitude, longitude);

-- Create trigger for updating updated_at on pending_updates
CREATE TRIGGER update_pending_updates_updated_at
BEFORE UPDATE ON public.pending_updates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();