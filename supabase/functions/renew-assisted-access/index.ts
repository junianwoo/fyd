import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { buildEmail, getCard, getButton, DEFAULT_EMAIL_OPTIONS } from "../_shared/email-templates.ts";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RENEW-ASSISTED-ACCESS] ${step}${detailsStr}`);
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

    // Get user ID from query params or body
    const url = new URL(req.url);
    const userIdFromQuery = url.searchParams.get("user_id");
    const tokenFromQuery = url.searchParams.get("token");
    
    let body;
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    
    const userId = body.userId || userIdFromQuery;
    const token = body.token || tokenFromQuery;

    if (!userId || !token) {
      throw new Error("Missing userId or token");
    }

    logStep("Processing renewal request", { userId });

    // Verify token matches expected format (simple validation)
    // Token should be: base64(userId + timestamp + secret)
    const expectedTokenPrefix = btoa(userId).substring(0, 10);
    if (!token.startsWith(expectedTokenPrefix)) {
      throw new Error("Invalid renewal token");
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("user_id, email, status, assisted_expires_at, assisted_renewed_count")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      throw new Error("User profile not found");
    }

    logStep("Profile found", { 
      email: profile.email, 
      status: profile.status,
      renewedCount: profile.assisted_renewed_count 
    });

    // Check if user has assisted access
    if (profile.status !== "assisted_access") {
      throw new Error("User does not have assisted access status");
    }

    // Check if already expired (allow renewal within 30 days after expiry)
    const expiryDate = new Date(profile.assisted_expires_at);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (expiryDate < thirtyDaysAgo) {
      throw new Error("Assisted access expired more than 30 days ago. Please reapply.");
    }

    // Extend expiry by 6 months from now (not from old expiry)
    const newExpiryDate = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
    const renewedCount = (profile.assisted_renewed_count || 0) + 1;

    // Update profile
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        assisted_expires_at: newExpiryDate.toISOString(),
        assisted_renewed_count: renewedCount,
      })
      .eq("user_id", userId);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    logStep("Assisted access renewed", { 
      newExpiry: newExpiryDate.toISOString(),
      renewedCount 
    });

    // Send confirmation email
    const siteUrl = Deno.env.get("SITE_URL") || "https://findyourdoctor.ca";
    
    const renewalCard = getCard(`
      <div style="text-align: center; padding: 12px 0;">
        <div style="font-size: 48px; margin-bottom: 12px;">✓</div>
        <h2 style="margin: 0 0 8px 0; color: #2ECC71; font-size: 24px; font-family: Georgia, 'Times New Roman', serif;">
          Assisted Access Renewed!
        </h2>
        <p style="margin: 0; color: #666; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Your access has been extended for another 6 months
        </p>
      </div>
    `, '#2ECC71');
    
    const detailsCard = getCard(`
      <h3 style="margin: 0 0 16px 0; color: #0F4C5C; font-size: 18px; font-family: Georgia, 'Times New Roman', serif;">
        Renewal Details
      </h3>
      <ul style="margin: 0; padding: 0; list-style: none;">
        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span style="color: #666;">New Expiry Date:</span>
          <strong style="float: right; color: #0F4C5C;">${newExpiryDate.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</strong>
        </li>
        <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span style="color: #666;">Renewals:</span>
          <strong style="float: right; color: #0F4C5C;">${renewedCount}</strong>
        </li>
        <li style="padding: 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span style="color: #666;">Status:</span>
          <strong style="float: right; color: #2ECC71;">Active</strong>
        </li>
      </ul>
    `, '#E8F5E9');

    const bodyContent = `
      ${renewalCard}
      
      <p style="margin: 24px 0; font-size: 16px; color: #333; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Your Assisted Access has been successfully renewed for another 6 months. You'll continue to receive email alerts when doctors in your monitored cities start accepting patients.
      </p>
      
      ${detailsCard}
      
      <div style="background: #FEF3C7; border-left: 4px solid #F4A261; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #92400E; font-weight: bold; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Financial Situation Improved?
        </p>
        <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          If your financial situation has improved, we kindly ask that you consider upgrading to our paid Alert Service ($7.99/month). Paid subscribers make it possible for us to continue offering Assisted Access to those who need it.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 32px;">
        ${getButton(`${siteUrl}/dashboard`, "View Dashboard")}
      </div>
      
      <div style="text-align: center; margin-top: 16px;">
        <p style="margin: 0; font-size: 13px; color: #999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          You'll receive another reminder 30 days before your next expiry date
        </p>
      </div>
    `;

    const htmlContent = buildEmail({
      preheaderText: "Your Assisted Access has been renewed for 6 months",
      title: "Assisted Access Renewed",
      bodyContent,
      options: DEFAULT_EMAIL_OPTIONS
    });

    // Send confirmation email
    try {
      logStep("Sending renewal confirmation email");
      await resend.emails.send({
        from: "FindYourDoctor <no-reply@findyourdoctor.ca>",
        to: profile.email,
        subject: "Assisted Access Renewed - FindYourDoctor",
        html: htmlContent,
        reply_to: "support@findyourdoctor.ca",
      });
      logStep("Confirmation email sent successfully");
    } catch (emailError) {
      logStep("Email send failed (non-critical)", { error: emailError });
      // Don't fail the renewal if email fails
    }

    // Return HTML response for browser access
    const successHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Assisted Access Renewed - FindYourDoctor</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 500px;
            margin: 80px auto;
            padding: 20px;
            text-align: center;
            background: #f9fafb;
          }
          .card {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .icon { font-size: 64px; margin-bottom: 16px; }
          h1 { color: #2ECC71; margin: 0 0 8px 0; font-size: 28px; }
          p { color: #666; line-height: 1.6; margin: 16px 0; }
          .button {
            display: inline-block;
            background: #00A6A6;
            color: white;
            padding: 12px 32px;
            border-radius: 6px;
            text-decoration: none;
            margin-top: 24px;
            font-weight: 500;
          }
          .button:hover { background: #008A8A; }
          .detail { background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 24px 0; text-align: left; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-row:last-child { border-bottom: none; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✓</div>
          <h1>Assisted Access Renewed!</h1>
          <p>Your access has been successfully extended for another 6 months.</p>
          
          <div class="detail">
            <div class="detail-row">
              <span>New Expiry Date:</span>
              <strong>${newExpiryDate.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</strong>
            </div>
            <div class="detail-row">
              <span>Renewals:</span>
              <strong>${renewedCount}</strong>
            </div>
            <div class="detail-row">
              <span>Status:</span>
              <strong style="color: #2ECC71;">Active</strong>
            </div>
          </div>
          
          <p>A confirmation email has been sent to ${profile.email}</p>
          
          <a href="${siteUrl}/dashboard" class="button">Go to Dashboard</a>
        </div>
      </body>
      </html>
    `;

    return new Response(successHtml, {
      headers: { ...corsHeaders, "Content-Type": "text/html" },
      status: 200,
    });

  } catch (error: any) {
    logStep("Error in function", { error: error.message });
    
    // Return HTML error response
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Renewal Error - FindYourDoctor</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 500px;
            margin: 80px auto;
            padding: 20px;
            text-align: center;
            background: #f9fafb;
          }
          .card {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .icon { font-size: 64px; margin-bottom: 16px; }
          h1 { color: #dc2626; margin: 0 0 8px 0; font-size: 28px; }
          p { color: #666; line-height: 1.6; margin: 16px 0; }
          .button {
            display: inline-block;
            background: #00A6A6;
            color: white;
            padding: 12px 32px;
            border-radius: 6px;
            text-decoration: none;
            margin-top: 24px;
            font-weight: 500;
          }
          .button:hover { background: #008A8A; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">⚠️</div>
          <h1>Renewal Failed</h1>
          <p>${error.message}</p>
          <p>If you continue to experience issues, please contact us at support@findyourdoctor.ca</p>
          <a href="${Deno.env.get("SITE_URL") || "https://findyourdoctor.ca"}/assisted-access" class="button">Back to Assisted Access</a>
        </div>
      </body>
      </html>
    `;

    return new Response(errorHtml, {
      headers: { ...corsHeaders, "Content-Type": "text/html" },
      status: 400,
    });
  }
});
