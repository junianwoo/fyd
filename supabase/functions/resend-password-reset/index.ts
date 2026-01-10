import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("[RESEND-PASSWORD] Request to send to:", email);

    // Check if user exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, email")
      .eq("email", email)
      .maybeSingle();
    
    if (profileError) {
      console.error("[RESEND-PASSWORD] Error checking profile:", profileError);
      throw new Error("Database error: " + profileError.message);
    }

    if (!profile) {
      console.error("[RESEND-PASSWORD] No profile found for:", email);
      throw new Error("No account found with this email. User may not have completed payment yet.");
    }

    console.log("[RESEND-PASSWORD] Profile found for user:", profile.user_id);

    // Call our branded password reset email function
    const { data, error } = await supabase.functions.invoke('send-password-reset', {
      body: { email }
    });

    if (error) {
      console.error("[RESEND-PASSWORD] Error sending email:", error);
      throw new Error("Failed to send email: " + error.message);
    }

    console.log("[RESEND-PASSWORD] Password reset email sent successfully to:", email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password reset email sent successfully",
        email: email,
        note: "Check inbox and spam folder. Link expires in 1 hour.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[RESEND-PASSWORD] Fatal error:", errorMessage);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: "Check Supabase Edge Function logs for more information"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
