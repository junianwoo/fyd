import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-CLAIM] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { token } = await req.json();
    
    if (!token) {
      throw new Error("Missing token");
    }

    logStep("Verifying token");

    // Find token in database
    const { data: verificationToken, error: tokenError } = await supabaseClient
      .from("verification_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .maybeSingle();

    if (tokenError || !verificationToken) {
      throw new Error("Invalid or expired token");
    }

    // Check if token is expired
    if (new Date(verificationToken.expires_at) < new Date()) {
      throw new Error("Token has expired. Please request a new verification link.");
    }

    logStep("Token valid", { doctorId: verificationToken.doctor_id });

    // Get doctor details
    const { data: doctor, error: doctorError } = await supabaseClient
      .from("doctors")
      .select("*")
      .eq("id", verificationToken.doctor_id)
      .single();

    if (doctorError || !doctor) {
      throw new Error("Doctor not found");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      doctor: {
        id: doctor.id,
        fullName: doctor.full_name,
        clinicName: doctor.clinic_name,
        address: doctor.address,
        city: doctor.city,
        province: doctor.province,
        postalCode: doctor.postal_code,
        phone: doctor.phone,
        email: doctor.email,
        website: doctor.website,
        acceptingStatus: doctor.accepting_status,
        languages: doctor.languages,
        accessibilityFeatures: doctor.accessibility_features,
        ageGroupsServed: doctor.age_groups_served,
        virtualAppointments: doctor.virtual_appointments,
      },
      tokenId: verificationToken.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
