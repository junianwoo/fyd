import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildEmail, getButton, getCard, DEFAULT_EMAIL_OPTIONS } from "../_shared/email-templates.ts";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ASSISTED-ACCESS-WELCOME] ${step}${detailsStr}`);
};

interface WelcomeEmailRequest {
  email: string;
  userId: string;
  passwordResetUrl?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { email, userId, passwordResetUrl }: WelcomeEmailRequest = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    logStep("Sending assisted access welcome email", { email });

    const siteUrl = Deno.env.get("SITE_URL") || "https://findyourdoctor.ca";
    
    // Generate password reset link if not provided
    let resetLink = passwordResetUrl;
    if (!resetLink && userId) {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: `${siteUrl}/reset-password`
        }
      });
      
      if (!error && data) {
        resetLink = data.properties?.action_link || `${siteUrl}/reset-password`;
      } else {
        resetLink = `${siteUrl}/reset-password`;
      }
    }
    
    // Build email body content
    const approvalCard = getCard(`
      <div style="text-align: center; padding: 12px 0;">
        <div style="font-size: 48px; margin-bottom: 12px;">✓</div>
        <h2 style="margin: 0 0 8px 0; color: #2ECC71; font-size: 24px; font-family: Georgia, 'Times New Roman', serif;">Application Approved!</h2>
        <p style="margin: 0; color: #666; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Your Assisted Access has been activated
        </p>
      </div>
    `, '#2ECC71');
    
    const whatYouGetCard = getCard(`
      <h3 style="margin: 0 0 16px 0; color: #0F4C5C; font-size: 18px; font-family: Georgia, 'Times New Roman', serif;">What's Included</h3>
      <ul style="margin: 0; padding: 0; list-style: none;">
        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span style="color: #2ECC71; font-weight: bold;">✓</span> Monitor up to <strong>3 cities</strong>
        </li>
        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span style="color: #2ECC71; font-weight: bold;">✓</span> Instant <strong>email alerts</strong> when doctors start accepting patients
        </li>
        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span style="color: #2ECC71; font-weight: bold;">✓</span> All the same features as paid Alert Service
        </li>
        <li style="padding: 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span style="color: #2ECC71; font-weight: bold;">✓</span> <strong>6 months</strong> of free access
        </li>
      </ul>
    `, '#E8F5E9');
    
    const bodyContent = `
      ${approvalCard}
      
      <p style="margin: 24px 0; font-size: 16px; color: #333; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Welcome to FindYourDoctor! We're glad we can help you in your search for a family doctor. Your Assisted Access gives you full access to our Alert Service at no cost for 6 months.
      </p>
      
      ${whatYouGetCard}
      
      <div style="background: #FEF3C7; border-left: 4px solid #F4A261; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <h3 style="margin: 0 0 8px 0; color: #92400E; font-size: 16px; font-family: Georgia, 'Times New Roman', serif;">Next Steps</h3>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #92400E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          First, you'll need to set your password to access your dashboard:
        </p>
        <div style="text-align: center; margin: 16px 0;">
          ${getButton('Set Your Password', resetLink!, '#F4A261')}
        </div>
      </div>
      
      <p style="margin: 24px 0 16px 0; font-size: 15px; color: #333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <strong>After setting your password:</strong>
      </p>
      <ol style="margin: 0 0 24px 0; padding-left: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <li style="margin-bottom: 8px; color: #666;">Sign in to your dashboard</li>
        <li style="margin-bottom: 8px; color: #666;">Set up alerts for up to 3 Ontario cities</li>
        <li style="margin-bottom: 8px; color: #666;">We'll email you whenever a doctor in your areas starts accepting patients</li>
      </ol>
      
      <div style="text-align: center; margin: 32px 0;">
        ${getButton('Go to Dashboard', `${siteUrl}/dashboard`, '#00A6A6')}
      </div>
      
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <strong>Need help getting started?</strong>
        </p>
        <p style="margin: 0; font-size: 14px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Reply to this email or visit our <a href="${siteUrl}/how-it-works" style="color: #00A6A6; text-decoration: none;">How It Works</a> page for detailed instructions.
        </p>
      </div>
      
      <p style="margin: 24px 0 0 0; font-size: 14px; color: #666; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <em>Thank you for being part of the FindYourDoctor community. We're here to help you find the care you need.</em>
      </p>
    `;
    
    const html = buildEmail({
      headerTitle: 'Welcome to FindYourDoctor',
      headerSubtitle: 'Your Assisted Access is Ready',
      bodyContent,
      siteUrl,
      includeUnsubscribe: false,
    });
    
    const emailResponse = await resend.emails.send({
      from: DEFAULT_EMAIL_OPTIONS.from!,
      replyTo: DEFAULT_EMAIL_OPTIONS.replyTo!,
      to: [email],
      subject: 'Welcome to FindYourDoctor - Your Assisted Access is Approved!',
      html,
    });

    logStep("Email sent successfully", { data: emailResponse.data });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Welcome email sent",
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
