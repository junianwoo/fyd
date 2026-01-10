-- Add advanced filter columns to alert_settings table
-- This enables users to optionally filter alerts by language and accessibility

-- Add toggle to enable/disable filtering
ALTER TABLE public.alert_settings 
  ADD COLUMN apply_filters BOOLEAN DEFAULT false;

-- Add specific accessibility filter columns
ALTER TABLE public.alert_settings 
  ADD COLUMN wheelchair_accessible BOOLEAN DEFAULT false,
  ADD COLUMN accessible_parking BOOLEAN DEFAULT false;

-- Add comments explaining the columns
COMMENT ON COLUMN public.alert_settings.apply_filters IS 'When true, only doctors matching the language and accessibility filters will trigger alerts';
COMMENT ON COLUMN public.alert_settings.wheelchair_accessible IS 'When true (and apply_filters is true), only alert for wheelchair accessible doctors';
COMMENT ON COLUMN public.alert_settings.accessible_parking IS 'When true (and apply_filters is true), only alert for doctors with accessible parking';

-- Note: languages column already exists as TEXT[] from previous migration
-- Note: accessibility_required BOOLEAN column is deprecated in favor of the two new specific columns
