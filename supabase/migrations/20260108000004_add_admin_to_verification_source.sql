-- Add 'admin' to the verification_source enum
-- This allows admins to be properly credited when they manually update doctor status

ALTER TYPE public.verification_source ADD VALUE IF NOT EXISTS 'admin';
