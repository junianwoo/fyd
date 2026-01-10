-- Add user_ids array to pending_updates table for better duplicate detection
ALTER TABLE public.pending_updates
ADD COLUMN IF NOT EXISTS user_ids text[] NOT NULL DEFAULT ARRAY[]::text[];

-- Add user_id to community_reports for audit trail
ALTER TABLE public.community_reports
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_updates_doctor_status ON public.pending_updates(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_community_reports_doctor_user ON public.community_reports(doctor_id, user_id);
