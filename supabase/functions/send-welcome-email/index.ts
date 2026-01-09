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
    const { email, userId, resetUrl } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    console.log("[WELCOME-EMAIL] Sending to:", email);

    // Send password reset email
    const siteUrl = resetUrl?.replace('/reset-password', '') || Deno.env.get("SITE_URL") || "https://findyourdoctor.ca";
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    if (error) {
      console.error("[WELCOME-EMAIL] Error:", error);
      throw error;
    }

    console.log("[WELCOME-EMAIL] Sent successfully to:", email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Welcome email sent",
        data 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[WELCOME-EMAIL] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error) 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
