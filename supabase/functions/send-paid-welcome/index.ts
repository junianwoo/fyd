import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { buildEmail, getButton, getCard, DEFAULT_EMAIL_OPTIONS } from "../_shared/email-templates.ts";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAID-WELCOME] ${step}${detailsStr}`);
};

interface WelcomeEmailRequest {
  email: string;
  customerName?: string;
  subscriptionId?: string;
  amount?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { email, customerName, subscriptionId, amount }: WelcomeEmailRequest = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    logStep("Sending paid welcome email", { email, subscriptionId });

    const siteUrl = Deno.env.get("SITE_URL") || "https://findyourdoctor.ca";
    const displayName = customerName || "there";
    const displayAmount = amount || "$7.99";
    
    // Build email body content
    const thankYouCard = getCard(`
      <div style="text-align: center; padding: 12px 0;">
        <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
        <h2 style="margin: 0 0 8px 0; color: #00A6A6; font-size: 24px; font-family: Georgia, 'Times New Roman', serif;">Welcome to Alert Service!</h2>
        <p style="margin: 0; color: #666; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Thank you for subscribing
        </p>
      </div>
    `, '#00A6A6');
    
    const subscriptionDetailsCard = getCard(`
      <h3 style="margin: 0 0 16px 0; color: #0F4C5C; font-size: 18px; font-family: Georgia, 'Times New Roman', serif;">Your Subscription</h3>
      <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <span style="color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Plan</span>
        <strong style="color: #0F4C5C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Alert Service</strong>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <span style="color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Billing</span>
        <strong style="color: #0F4C5C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${displayAmount}/month</strong>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 12px 0;">
        <span style="color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Next billing date</span>
        <strong style="color: #0F4C5C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
      </div>
      <p style="margin: 16px 0 0 0; font-size: 13px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Your subscription receipt has been sent separately. You can manage your subscription anytime from your dashboard.
      </p>
    `, '#F3FBFA');
    
    const featuresCard = getCard(`
      <h3 style="margin: 0 0 16px 0; color: #0F4C5C; font-size: 18px; font-family: Georgia, 'Times New Roman', serif;">What's Included</h3>
      <ul style="margin: 0; padding: 0; list-style: none;">
        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span style="color: #2ECC71; font-weight: bold;">✓</span> Monitor up to <strong>3 cities</strong> across Ontario
        </li>
        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span style="color: #2ECC71; font-weight: bold;">✓</span> <strong>Instant email alerts</strong> when doctors start accepting patients
        </li>
        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span style="color: #2ECC71; font-weight: bold;">✓</span> Customizable alert filters (languages, accessibility)
        </li>
        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span style="color: #2ECC71; font-weight: bold;">✓</span> Access to full doctor database
        </li>
        <li style="padding: 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span style="color: #2ECC71; font-weight: bold;">✓</span> <strong>Cancel anytime</strong>, no commitment
        </li>
      </ul>
    `, '#E8F5E9');
    
    const bodyContent = `
      ${thankYouCard}
      
      <p style="margin: 24px 0; font-size: 16px; color: #333; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Hi ${displayName},
      </p>
      
      <p style="margin: 0 0 24px 0; font-size: 16px; color: #333; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Thank you for subscribing to FindYourDoctor Alert Service! Your support helps us assist thousands of Ontarians in finding family doctors, including those who use our free Assisted Access program.
      </p>
      
      ${subscriptionDetailsCard}
      
      ${featuresCard}
      
      <div style="background: #F3FBFA; border-left: 4px solid #00A6A6; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <h3 style="margin: 0 0 8px 0; color: #0F4C5C; font-size: 16px; font-family: Georgia, 'Times New Roman', serif;">Getting Started</h3>
        <ol style="margin: 8px 0 0 0; padding-left: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <li style="margin-bottom: 8px; color: #666;">Sign in to your dashboard</li>
          <li style="margin-bottom: 8px; color: #666;">Add up to 3 cities you want to monitor</li>
          <li style="margin-bottom: 8px; color: #666;">Customize your alert preferences (optional)</li>
          <li style="color: #666;">We'll email you whenever a doctor in your areas starts accepting patients!</li>
        </ol>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        ${getButton('Set Up Your Alerts', `${siteUrl}/dashboard`, '#00A6A6')}
      </div>
      
      <div style="background: #FEF3C7; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; color: #92400E; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <strong>💛 Your subscription helps others</strong><br/>
          Your support makes it possible for us to offer free Assisted Access to Ontarians facing financial barriers.
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <strong>Need help?</strong>
        </p>
        <p style="margin: 0; font-size: 14px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Reply to this email anytime, or visit our <a href="${siteUrl}/how-it-works" style="color: #00A6A6; text-decoration: none;">How It Works</a> page for detailed setup instructions.
        </p>
      </div>
      
      <p style="margin: 24px 0 0 0; font-size: 14px; color: #666; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <em>Welcome to the FindYourDoctor community!</em>
      </p>
    `;
    
    const html = buildEmail({
      headerTitle: 'Thank You for Subscribing!',
      headerSubtitle: 'Your Alert Service is now active',
      bodyContent,
      siteUrl,
      includeUnsubscribe: false,
    });
    
    const emailResponse = await resend.emails.send({
      from: DEFAULT_EMAIL_OPTIONS.from!,
      replyTo: DEFAULT_EMAIL_OPTIONS.replyTo!,
      to: [email],
      subject: 'Welcome to FindYourDoctor Alert Service! 🎉',
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
