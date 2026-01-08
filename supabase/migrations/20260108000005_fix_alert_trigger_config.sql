-- Fix the alert trigger to handle missing configuration parameters gracefully
-- This prevents errors when admins manually update doctor status

CREATE OR REPLACE FUNCTION public.trigger_doctor_alert()
RETURNS TRIGGER
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
    
    -- Try to get configuration parameters (may not be set)
    BEGIN
      supabase_url := current_setting('app.supabase_url', true);
      service_role_key := current_setting('app.supabase_service_role_key', true);
    EXCEPTION WHEN OTHERS THEN
      -- If config parameters aren't set, just log and return
      RAISE LOG 'Alert trigger skipped - configuration parameters not set for doctor: % (%)', NEW.full_name, NEW.id;
      RETURN NEW;
    END;
    
    -- Only call the edge function if we have the required config
    IF supabase_url IS NOT NULL AND service_role_key IS NOT NULL THEN
      -- Call the alert engine Edge Function asynchronously
      PERFORM net.http_post(
        url := supabase_url || '/functions/v1/run-alert-engine',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object('doctorId', NEW.id::text)
      );
      
      RAISE LOG 'Alert trigger fired for doctor: % (%)', NEW.full_name, NEW.id;
    ELSE
      RAISE LOG 'Alert trigger skipped - configuration incomplete for doctor: % (%)', NEW.full_name, NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.trigger_doctor_alert() IS 'Automatically triggers alert emails when a doctor changes status to accepting patients. Gracefully handles missing configuration.';
