import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CLAIM-LISTING] ${step}${detailsStr}`);
};

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

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

    const { doctorId, email } = await req.json();
    
    if (!doctorId || !email) {
      throw new Error("Missing required fields: doctorId, email");
    }

    logStep("Processing claim request", { doctorId, email });

    // Get doctor details
    const { data: doctor, error: doctorError } = await supabaseClient
      .from("doctors")
      .select("*")
      .eq("id", doctorId)
      .single();

    if (doctorError || !doctor) {
      throw new Error("Doctor not found");
    }

    logStep("Doctor found", { name: doctor.full_name, clinic: doctor.clinic_name });

    // Generate verification token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    const { error: tokenError } = await supabaseClient
      .from("verification_tokens")
      .insert({
        doctor_id: doctorId,
        token: token,
        email: email,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      logStep("Error storing token", { error: tokenError.message });
      throw new Error("Failed to create verification token");
    }

    // Send magic link email
    const siteUrl = Deno.env.get("SITE_URL") || "https://findyourdoctor.ca";
    const magicLink = `${siteUrl}/claim-verify?token=${token}`;

    const emailResponse = await resend.emails.send({
      from: "FindYourDoctor <noreply@findyourdoctor.ca>",
      to: [email],
      subject: `Verify your clinic listing: ${doctor.clinic_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #00857C; padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Claim Your Listing</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none;">
            <p style="margin: 0 0 16px 0;">Hello,</p>
            
            <p style="margin: 0 0 16px 0;">
              We received a request to claim and manage the following listing on FindYourDoctor.ca:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #00857C;">
              <h3 style="margin: 0 0 8px 0;">${doctor.full_name}</h3>
              <p style="margin: 0; color: #666;">${doctor.clinic_name}</p>
              <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">${doctor.address}, ${doctor.city}</p>
            </div>
            
            <p style="margin: 0 0 24px 0;">
              Click the button below to verify your email and manage this listing:
            </p>
            
            <a href="${magicLink}" style="display: inline-block; background: #00857C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Verify & Claim Listing
            </a>
            
            <p style="margin: 24px 0 0 0; font-size: 14px; color: #666;">
              This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
          
          <div style="padding: 20px; text-align: center; font-size: 12px; color: #999;">
            <p>© ${new Date().getFullYear()} FindYourDoctor.ca</p>
          </div>
        </body>
        </html>
      `,
    });

    logStep("Magic link email sent", { to: email, data: emailResponse.data });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Verification email sent! Check your inbox." 
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
