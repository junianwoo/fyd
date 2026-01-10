import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { buildEmail, getButton, getCard, DEFAULT_EMAIL_OPTIONS } from "../_shared/email-templates.ts";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-PASSWORD-RESET] ${step}${detailsStr}`);
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

    const { email } = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    logStep("Processing password reset request", { email });

    const siteUrl = Deno.env.get("SITE_URL") || "https://findyourdoctor.ca";

    // Generate password reset link using Supabase
    const { data, error } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${siteUrl}/reset-password`,
      }
    });

    if (error) {
      logStep("Error generating reset link", { error: error.message });
      throw new Error(`Failed to generate reset link: ${error.message}`);
    }

    if (!data?.properties?.action_link) {
      throw new Error("No reset link generated");
    }

    const resetLink = data.properties.action_link;
    logStep("Reset link generated successfully");

    // Build branded email
    const instructionCard = getCard(`
      <div style="text-align: center; padding: 12px 0;">
        <div style="font-size: 48px; margin-bottom: 12px;">🔑</div>
        <h2 style="margin: 0 0 8px 0; color: #0F4C5C; font-size: 24px; font-family: Georgia, 'Times New Roman', serif;">Password Reset Request</h2>
        <p style="margin: 0; color: #666; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          We received a request to reset your password
        </p>
      </div>
    `, '#00A6A6');

    const securityNote = `
      <div style="background: #FEF3E5; padding: 16px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #F4A261;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #92400E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <strong>⚠️ Security Notice</strong>
        </p>
        <p style="margin: 0; font-size: 14px; color: #92400E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          This link will expire in 1 hour for security reasons. If you didn't request this password reset, you can safely ignore this email.
        </p>
      </div>
    `;

    const bodyContent = `
      ${instructionCard}
      
      <p style="margin: 24px 0; font-size: 16px; color: #333; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Hi there,
      </p>
      
      <p style="margin: 0 0 24px 0; font-size: 16px; color: #333; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Someone requested a password reset for your FindYourDoctor.ca account. Click the button below to create a new password:
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        ${getButton("Reset My Password", resetLink, '#00A6A6')}
      </div>
      
      <p style="margin: 24px 0; font-size: 14px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Or copy and paste this link into your browser:
      </p>
      <p style="margin: 0 0 24px 0; font-size: 12px; color: #999; word-break: break-all; font-family: monospace;">
        ${resetLink}
      </p>
      
      ${securityNote}
      
      <p style="margin: 24px 0 0 0; font-size: 14px; color: #666; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        If you didn't request this, please contact us at support@findyourdoctor.ca
      </p>
    `;

    const html = buildEmail({
      headerTitle: 'Reset Your Password',
      headerSubtitle: 'Secure your account with a new password',
      bodyContent: bodyContent,
      siteUrl,
      includeUnsubscribe: false,
    });

    // Send email via Resend
    logStep("Sending password reset email");

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: DEFAULT_EMAIL_OPTIONS.from!,
      reply_to: DEFAULT_EMAIL_OPTIONS.replyTo!,
      to: [email],
      subject: "Reset your FindYourDoctor.ca password",
      html: html,
    });

    if (emailError) {
      logStep("Error sending email", { error: emailError });
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    logStep("Password reset email sent successfully", { messageId: emailData?.id });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Password reset email sent successfully" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    logStep("Error in function", { error: error.message });
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
