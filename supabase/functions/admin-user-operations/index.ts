import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/cors.ts";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-USER-OPS] ${step}${detailsStr}`);
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

    // Get the authorization token from headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      logStep("No authorization header provided");
      throw new Error("Unauthorized: No authorization header");
    }

    // Verify the calling user is an admin
    const token = authHeader.replace("Bearer ", "");
    logStep("Attempting to verify user token");
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      logStep("User verification failed", { error: userError.message });
      throw new Error(`Unauthorized: ${userError.message}`);
    }
    
    if (!user) {
      logStep("No user found from token");
      throw new Error("Unauthorized: Invalid token");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user has admin role
    const { data: userRole, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !userRole) {
      logStep("Access denied - user is not admin", { userId: user.id });
      throw new Error("Unauthorized: Admin access required");
    }

    logStep("Admin verified", { userId: user.id });

    // Parse request body
    const { action, userId, status } = await req.json();

    if (!action || !userId) {
      throw new Error("Missing required fields: action, userId");
    }

    logStep("Processing action", { action, targetUserId: userId });

    // Handle different actions
    switch (action) {
      case "delete": {
        // Delete user from auth (this will cascade to profiles via trigger)
        const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId);

        if (deleteError) {
          throw new Error(`Failed to delete user: ${deleteError.message}`);
        }

        logStep("User deleted successfully", { userId });

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "User deleted successfully" 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 
          }
        );
      }

      case "update": {
        if (!status) {
          throw new Error("Missing status field for update action");
        }

        // Update user profile status
        const { error: updateError } = await supabaseClient
          .from("profiles")
          .update({ status })
          .eq("user_id", userId);

        if (updateError) {
          throw new Error(`Failed to update user: ${updateError.message}`);
        }

        logStep("User updated successfully", { userId, newStatus: status });

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "User updated successfully" 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 
          }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error: any) {
    const errorMessage = error.message || "Unknown error";
    logStep("Error in function", { error: errorMessage });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: error.message?.includes("Unauthorized") ? 403 : 400
      }
    );
  }
});
