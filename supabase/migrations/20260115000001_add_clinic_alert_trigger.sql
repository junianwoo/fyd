-- Add alert trigger for clinics table (after rename from doctors)
-- This trigger automatically sends alert emails when a clinic status changes to "accepting"

-- Drop old trigger if it exists (from doctors table)
DROP TRIGGER IF EXISTS on_doctor_accepting_status_change ON public.doctors;
DROP TRIGGER IF EXISTS on_clinic_accepting_status_change ON public.clinics;

-- Create/replace the trigger function for clinics
CREATE OR REPLACE FUNCTION public.trigger_clinic_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Only trigger if status changed TO 'accepting'
  IF NEW.accepting_status = 'accepting' AND
     (OLD.accepting_status IS NULL OR OLD.accepting_status != 'accepting') THEN
    
    -- Get configuration from pg_settings or environment
    SELECT current_setting('app.settings.supabase_url', true) INTO supabase_url;
    SELECT current_setting('app.settings.service_role_key', true) INTO service_role_key;
    
    -- Only proceed if configuration is available
    IF supabase_url IS NOT NULL AND service_role_key IS NOT NULL THEN
      -- Make async HTTP request to run-alert-engine edge function
      PERFORM net.http_post(
        url := supabase_url || '/functions/v1/run-alert-engine',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object('clinicId', NEW.id)
      );
      
      RAISE LOG 'Alert trigger fired for clinic: % (%)', NEW.name, NEW.id;
    ELSE
      RAISE LOG 'Alert trigger skipped - configuration parameters not set for clinic: % (%)', NEW.name, NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on clinics table
DROP TRIGGER IF EXISTS on_clinic_accepting_status_change ON public.clinics;

CREATE TRIGGER on_clinic_accepting_status_change
  AFTER UPDATE OF accepting_status ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_clinic_alert();

COMMENT ON FUNCTION public.trigger_clinic_alert() IS 'Automatically triggers alert emails when a clinic changes status to accepting patients';
COMMENT ON TRIGGER on_clinic_accepting_status_change ON public.clinics IS 'Fires alert emails when clinic status becomes accepting';
