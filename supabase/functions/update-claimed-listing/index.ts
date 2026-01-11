import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPDATE-CLAIMED-LISTING] ${step}${detailsStr}`);
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

    const { token, updates } = await req.json();
    
    if (!token || !updates) {
      throw new Error("Missing token or updates");
    }

    logStep("Processing update request");

    // Verify token is still valid
    const { data: verificationToken, error: tokenError } = await supabaseClient
      .from("verification_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .maybeSingle();

    if (tokenError || !verificationToken) {
      throw new Error("Invalid or expired token");
    }

    if (new Date(verificationToken.expires_at) < new Date()) {
      throw new Error("Token has expired. Please request a new verification link.");
    }

    logStep("Token valid, updating clinic", { clinicId: verificationToken.clinic_id });

    // Get previous status to check for alert trigger
    const { data: currentClinic } = await supabaseClient
      .from("clinics")
      .select("accepting_status")
      .eq("id", verificationToken.clinic_id)
      .single();

    const previousStatus = currentClinic?.accepting_status;

    // Update clinic listing
    const updateData: Record<string, any> = {
      claimed_by_clinic: true,
      status_verified_by: "clinic",
      status_last_updated_at: new Date().toISOString(),
      profile_last_updated_at: new Date().toISOString(),
    };

    // Only update allowed fields
    const allowedFields = [
      "accepting_status",
      "phone",
      "email",
      "website",
      "languages",
      "accessibility_features",
      "age_groups_served",
      "virtual_appointments",
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    const { error: updateError } = await supabaseClient
      .from("clinics")
      .update(updateData)
      .eq("id", verificationToken.clinic_id);

    if (updateError) {
      throw new Error(`Failed to update listing: ${updateError.message}`);
    }

    // Mark token as used
    await supabaseClient
      .from("verification_tokens")
      .update({ used: true })
      .eq("id", verificationToken.id);

    // Delete all pending updates for this clinic (clinic verification overrides community)
    await supabaseClient
      .from("pending_updates")
      .delete()
      .eq("clinic_id", verificationToken.clinic_id);

    logStep("Listing updated successfully");

    // If status changed to accepting, trigger alerts
    if (updates.accepting_status === "accepting" && previousStatus !== "accepting") {
      logStep("Status changed to accepting, triggering alerts");
      
      // Call the alert engine (fire and forget)
      fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/run-alert-engine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({ clinicId: verificationToken.clinic_id }),
      }).then(() => {
        logStep("Alert engine invoked");
      }).catch(err => {
        logStep("Error invoking alert engine", { error: err.message });
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Listing updated successfully! Your changes are now live." 
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
