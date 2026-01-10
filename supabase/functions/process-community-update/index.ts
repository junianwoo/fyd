import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-COMMUNITY-UPDATE] ${step}${detailsStr}`);
};

const THRESHOLD = 2; // Number of reports needed to update status

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

    const { doctorId, reportedStatus, details } = await req.json();
    
    if (!doctorId || !reportedStatus) {
      throw new Error("Missing required fields: doctorId, reportedStatus");
    }

    // Get IP address from request headers (server-side capture)
    const reporterIp = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                       req.headers.get("x-real-ip") || 
                       "unknown";

    // Get authenticated user ID if available
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabaseClient.auth.getUser(token);
        userId = user?.id || null;
      } catch (err) {
        logStep("Could not extract user from auth token", { error: err.message });
      }
    }

    logStep("Processing update", { doctorId, reportedStatus, reporterIp, userId });

    // Get current doctor status
    const { data: doctor, error: doctorError } = await supabaseClient
      .from("doctors")
      .select("accepting_status")
      .eq("id", doctorId)
      .single();

    if (doctorError) throw doctorError;
    
    const previousStatus = doctor.accepting_status;
    logStep("Current doctor status", { previousStatus });

    // Insert community report (for audit trail)
    const { error: reportError } = await supabaseClient
      .from("community_reports")
      .insert({
        doctor_id: doctorId,
        reported_status: reportedStatus,
        details: details || null,
        reporter_ip: reporterIp || null,
        user_id: userId || null,
      });

    if (reportError) {
      logStep("Error inserting community report", { error: reportError.message });
    }

    // Check for existing pending update for this status
    const { data: existingUpdate, error: existingError } = await supabaseClient
      .from("pending_updates")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("status", reportedStatus)
      .maybeSingle();

    if (existingError) throw existingError;

    let statusUpdated = false;
    let newCount = 1;

    if (existingUpdate) {
      // Check if IP or User ID already reported (duplicate detection)
      const ipAddresses = existingUpdate.ip_addresses || [];
      const userIds = existingUpdate.user_ids || [];
      
      // Block if same IP already reported
      if (reporterIp && reporterIp !== "unknown" && ipAddresses.includes(reporterIp)) {
        logStep("Duplicate report detected - same IP already reported", { reporterIp });
        return new Response(JSON.stringify({ 
          success: false, 
          message: "You've already submitted an update for this doctor today. Thank you!",
          statusUpdated: false,
          duplicate: true
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      // Block if same user ID already reported
      if (userId && userIds.includes(userId)) {
        logStep("Duplicate report detected - same user already reported", { userId });
        return new Response(JSON.stringify({ 
          success: false, 
          message: "You've already submitted an update for this doctor today. Thank you!",
          statusUpdated: false,
          duplicate: true
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Update count and add IP/User ID
      newCount = existingUpdate.count + 1;
      const newIpAddresses = reporterIp && reporterIp !== "unknown" ? [...ipAddresses, reporterIp] : ipAddresses;
      const newUserIds = userId ? [...userIds, userId] : userIds;

      if (newCount >= THRESHOLD) {
        // Threshold met! Update doctor status
        logStep("Threshold met, updating doctor status", { newCount, reportedStatus });
        
        // Update doctor status
        const { error: updateDoctorError } = await supabaseClient
          .from("doctors")
          .update({
            accepting_status: reportedStatus,
            status_last_updated_at: new Date().toISOString(),
            status_verified_by: "community",
            community_report_count: (existingUpdate.count || 0) + 1,
          })
          .eq("id", doctorId);

        if (updateDoctorError) throw updateDoctorError;

        // Delete ALL pending updates for this doctor (reset counters)
        const { error: deleteError } = await supabaseClient
          .from("pending_updates")
          .delete()
          .eq("doctor_id", doctorId);

        if (deleteError) {
          logStep("Error deleting pending updates", { error: deleteError.message });
        }

        statusUpdated = true;

        // If status changed to accepting, trigger alerts
        if (reportedStatus === "accepting" && previousStatus !== "accepting") {
          logStep("Status changed to accepting, will trigger alerts");
          
          // Call the alert engine to send notifications (fire and forget)
          fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/run-alert-engine`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            },
            body: JSON.stringify({ doctorId }),
          }).then(() => {
            logStep("Alert engine invoked");
          }).catch(err => {
            logStep("Error invoking alert engine", { error: err.message });
          });
        }
      } else {
        // Update pending count
        const { error: updateError } = await supabaseClient
          .from("pending_updates")
          .update({
            count: newCount,
            ip_addresses: newIpAddresses,
            user_ids: newUserIds,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingUpdate.id);

        if (updateError) throw updateError;
        logStep("Updated pending count", { newCount });
      }
    } else {
      // Create new pending update
      const { error: insertError } = await supabaseClient
        .from("pending_updates")
        .insert({
          doctor_id: doctorId,
          status: reportedStatus,
          count: 1,
          ip_addresses: (reporterIp && reporterIp !== "unknown") ? [reporterIp] : [],
          user_ids: userId ? [userId] : [],
        });

      if (insertError) throw insertError;
      logStep("Created new pending update");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Thank you! You're helping someone find a family doctor.",
      statusUpdated,
      pendingCount: statusUpdated ? 0 : newCount,
      threshold: THRESHOLD
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
