import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { buildEmail, getButton, getCard, DEFAULT_EMAIL_OPTIONS } from "../_shared/email-templates.ts";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    const { clinicId, email } = await req.json();
    
    if (!clinicId || !email) {
      throw new Error("Missing required fields: clinicId, email");
    }

    logStep("Processing claim request", { clinicId, email });

    // Get clinic details
    const { data: clinic, error: clinicError } = await supabaseClient
      .from("clinics")
      .select("*")
      .eq("id", clinicId)
      .single();

    if (clinicError || !clinic) {
      throw new Error("Clinic not found");
    }

    logStep("Clinic found", { name: clinic.name });

    // Generate verification token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    const { error: tokenError } = await supabaseClient
      .from("verification_tokens")
      .insert({
        clinic_id: clinicId,
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

    // Build email body content
    const clinicInfoCard = getCard(`
      <h3 style="margin: 0 0 8px 0; color: #0F4C5C; font-size: 18px; font-family: Georgia, 'Times New Roman', serif;">${clinic.name}</h3>
      <p style="margin: 0; color: #666; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${clinic.address}, ${clinic.city}</p>
    `, '#00A6A6');

    const bodyContent = `
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Hello,
      </p>
      
      <p style="margin: 0 0 24px 0; font-size: 16px; color: #333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        We received a request to claim and manage the following listing on FindYourDoctor.ca:
      </p>
      
      ${clinicInfoCard}
      
      <p style="margin: 24px 0; font-size: 16px; color: #333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Click the button below to verify your email and manage this listing:
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        ${getButton('Verify & Claim Listing', magicLink, '#00A6A6')}
      </div>
      
      <div style="background: #FEF3C7; border-left: 4px solid #F4A261; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; color: #92400E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <strong>⏰ This link will expire in 24 hours.</strong><br>
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
      
      <div style="background: #F3FBFA; border-left: 4px solid #00A6A6; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <h3 style="margin: 0 0 8px 0; color: #0F4C5C; font-size: 16px; font-family: Georgia, 'Times New Roman', serif;">What You Can Do After Claiming</h3>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <li style="margin-bottom: 8px; color: #666;">Update your clinic's accepting status anytime</li>
          <li style="margin-bottom: 8px; color: #666;">Ensure your contact information is accurate</li>
          <li style="margin-bottom: 8px; color: #666;">Help patients find you faster</li>
          <li style="color: #666;">Build trust with the "Verified by Clinic" badge</li>
        </ul>
      </div>
    `;
    
    const html = buildEmail({
      headerTitle: 'Claim Your Listing',
      headerSubtitle: 'Verify your email to manage your clinic on FindYourDoctor',
      bodyContent,
      siteUrl,
      includeUnsubscribe: false,
    });

    const emailResponse = await resend.emails.send({
      from: DEFAULT_EMAIL_OPTIONS.from!,
      replyTo: DEFAULT_EMAIL_OPTIONS.replyTo,
      to: [email],
      subject: `Verify your clinic listing: ${clinic.name}`,
      html,
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
