import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildEmail, getButton, getCard, DEFAULT_EMAIL_OPTIONS } from "../_shared/email-templates.ts";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PASSWORD-RESET] ${step}${detailsStr}`);
};

interface PasswordResetRequest {
  email: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { email }: PasswordResetRequest = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    logStep("Generating password reset link", { email });

    const siteUrl = Deno.env.get("SITE_URL") || "https://findyourdoctor.ca";
    
    // Generate password reset link using Supabase Auth Admin API
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${siteUrl}/reset-password`
      }
    });
    
    if (error) {
      throw new Error(`Failed to generate reset link: ${error.message}`);
    }
    
    const resetLink = data.properties?.action_link || `${siteUrl}/reset-password`;
    
    logStep("Sending password reset email", { email });
    
    // Build email body content
    const instructionsCard = getCard(`
      <h3 style="margin: 0 0 12px 0; color: #0F4C5C; font-size: 18px; font-family: Georgia, 'Times New Roman', serif;">Reset Your Password</h3>
      <p style="margin: 0 0 16px 0; color: #666; font-size: 15px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        We received a request to reset your password. Click the button below to create a new password for your FindYourDoctor account.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        ${getButton('Reset My Password', resetLink, '#00A6A6')}
      </div>
      <p style="margin: 16px 0 0 0; color: #666; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Or copy and paste this link into your browser:<br/>
        <a href="${resetLink}" style="color: #00A6A6; word-break: break-all; text-decoration: none;">${resetLink}</a>
      </p>
    `, '#00A6A6');
    
    const bodyContent = `
      ${instructionsCard}
      
      <div style="background: #FEF3C7; border-left: 4px solid #F4A261; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #92400E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <strong>⏰ This link expires in 1 hour</strong>
        </p>
        <p style="margin: 0; font-size: 14px; color: #92400E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          For security reasons, password reset links are only valid for 60 minutes. If your link expires, you can request a new one.
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <strong>Didn't request a password reset?</strong>
        </p>
        <p style="margin: 0; font-size: 14px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          If you didn't request this, you can safely ignore this email. Your password will remain unchanged and your account is secure.
        </p>
      </div>
      
      <p style="margin: 24px 0 0 0; font-size: 14px; color: #666; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <strong>Need help?</strong> Reply to this email and we'll be happy to assist you.
      </p>
    `;
    
    const html = buildEmail({
      headerTitle: 'Password Reset Request',
      headerSubtitle: 'Let\'s get you back into your account',
      bodyContent,
      siteUrl,
      includeUnsubscribe: false,
    });
    
    const emailResponse = await resend.emails.send({
      from: DEFAULT_EMAIL_OPTIONS.from!,
      replyTo: DEFAULT_EMAIL_OPTIONS.replyTo!,
      to: [email],
      subject: 'Reset Your FindYourDoctor Password',
      html,
    });

    logStep("Email sent successfully", { data: emailResponse.data });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Password reset email sent",
      data: emailResponse.data 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("ERROR sending email", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
