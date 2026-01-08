-- Enable pg_net extension for async HTTP calls from database triggers
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to trigger doctor alert emails when status changes to "accepting"
CREATE OR REPLACE FUNCTION public.trigger_doctor_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only trigger if status changed TO 'accepting'
  IF NEW.accepting_status = 'accepting' AND 
     (OLD.accepting_status IS NULL OR OLD.accepting_status != 'accepting') THEN
    
    -- Call the alert engine Edge Function asynchronously
    -- This will match the doctor with all users who have alerts in the area
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/run-alert-engine',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := jsonb_build_object('doctorId', NEW.id::text)
    );
    
    RAISE LOG 'Alert trigger fired for doctor: % (%)', NEW.full_name, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on doctors table
DROP TRIGGER IF EXISTS on_doctor_accepting_status_change ON public.doctors;

CREATE TRIGGER on_doctor_accepting_status_change
  AFTER UPDATE OF accepting_status ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_doctor_alert();

-- Add comment
COMMENT ON FUNCTION public.trigger_doctor_alert() IS 'Automatically triggers alert emails when a doctor changes status to accepting patients';
