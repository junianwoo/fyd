-- Fix: Update handle_new_user() to set assisted_expires_at when user applies for assisted access
-- This ensures the 6-month term is properly tracked and expiry reminders work

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Check if user is applying for assisted access via signup metadata
    IF (NEW.raw_user_meta_data->>'applying_for_assisted_access')::boolean = true THEN
        -- Create profile with assisted access status and 6-month expiry
        INSERT INTO public.profiles (
            user_id, 
            email, 
            status, 
            assisted_reason,
            assisted_expires_at,
            assisted_renewed_count
        )
        VALUES (
            NEW.id, 
            NEW.email, 
            'assisted_access',
            NEW.raw_user_meta_data->>'assisted_reason',
            NOW() + INTERVAL '6 months',
            0
        );
    ELSE
        -- Regular user profile (free or will upgrade to alert_service via Stripe)
        INSERT INTO public.profiles (user_id, email)
        VALUES (NEW.id, NEW.email);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Add comment explaining the fix
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates user profile on signup. For assisted access applicants, sets 6-month expiry date automatically.';
