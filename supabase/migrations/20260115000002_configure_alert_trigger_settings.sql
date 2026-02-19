-- Configure database settings for alert trigger
-- These settings allow the trigger to call the run-alert-engine edge function

-- Note: These values need to be set to your actual Supabase project values
-- Replace YOUR_PROJECT_REF with your actual project reference (e.g., abcdefghijk)
-- Replace YOUR_SERVICE_ROLE_KEY with your actual service role key

-- Set Supabase URL (will be used by trigger)
-- ALTER DATABASE postgres SET app.settings.supabase_url = 'https://YOUR_PROJECT_REF.supabase.co';

-- Set Service Role Key (will be used by trigger for authentication)
-- ALTER DATABASE postgres SET app.settings.service_role_key = 'YOUR_SERVICE_ROLE_KEY';

-- INSTRUCTIONS:
-- 1. Get your project ref from Supabase dashboard URL: https://supabase.com/dashboard/project/YOUR_PROJECT_REF
-- 2. Get your service role key from: Project Settings → API → service_role key (secret)
-- 3. Uncomment the ALTER DATABASE commands above
-- 4. Replace YOUR_PROJECT_REF with your actual project ref
-- 5. Replace YOUR_SERVICE_ROLE_KEY with your actual service role key
-- 6. Run this SQL in Supabase SQL Editor

-- Verify settings after running (should show your values):
-- SELECT name, setting FROM pg_settings WHERE name LIKE 'app.settings.%';
