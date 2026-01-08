-- Add latitude and longitude columns to alert_settings table for precise location matching
-- This enables accurate distance calculations for postal codes and city names

ALTER TABLE public.alert_settings 
  ADD COLUMN latitude DOUBLE PRECISION,
  ADD COLUMN longitude DOUBLE PRECISION;

-- Create index on coordinates for faster distance queries
CREATE INDEX idx_alert_settings_coords ON public.alert_settings(latitude, longitude);

-- Add comment explaining the columns
COMMENT ON COLUMN public.alert_settings.latitude IS 'Latitude coordinate from geocoding the city_postal field';
COMMENT ON COLUMN public.alert_settings.longitude IS 'Longitude coordinate from geocoding the city_postal field';
