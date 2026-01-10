import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { buildEmail, getButton, getCard, DEFAULT_EMAIL_OPTIONS } from "../_shared/email-templates.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-EXPIRY-REMINDERS] ${step}${detailsStr}`);
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
    logStep("Starting expiry reminder check");

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const siteUrl = Deno.env.get("SITE_URL") || "https://findyourdoctor.ca";

    // Get all assisted access users
    const { data: users, error: usersError } = await supabaseClient
      .from("profiles")
      .select("user_id, email, assisted_expires_at, assisted_renewed_count")
      .eq("status", "assisted_access")
      .not("assisted_expires_at", "is", null);

    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }

    logStep("Found assisted access users", { count: users?.length || 0 });

    let remindersSent = 0;

    for (const user of users || []) {
      const expiryDate = new Date(user.assisted_expires_at);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      // Send 30-day reminder
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 28) {
        logStep("Sending 30-day reminder", { email: user.email, daysUntilExpiry });
        
        const expiryCard30 = getCard(`
          <div style="text-align: center; padding: 12px 0;">
            <div style="font-size: 48px; margin-bottom: 12px;">⏰</div>
            <h2 style="margin: 0 0 8px 0; color: #F4A261; font-size: 24px; font-family: Georgia, 'Times New Roman', serif;">30 Days Until Expiry</h2>
            <p style="margin: 0; color: #666; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              Your Assisted Access expires on ${expiryDate.toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        `, '#F4A261');
        
        const renewalNote30 = user.assisted_renewed_count && user.assisted_renewed_count >= 2
          ? `<div style="background: #FEF3C7; border-left: 4px solid #F4A261; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0; font-size: 14px; color: #92400E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <strong>Note:</strong> You've renewed twice already. Further renewals may require review.
              </p>
            </div>`
          : `<p style="margin: 16px 0; font-size: 15px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              You can renew for another 6 months with a single click.
            </p>`;
        
        const bodyContent30 = `
          ${expiryCard30}
          
          <p style="margin: 24px 0; font-size: 16px; color: #333; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Hi there,
          </p>
          
          <p style="margin: 0 0 24px 0; font-size: 16px; color: #333; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            This is a friendly reminder that your Assisted Access subscription expires in <strong>30 days</strong>. If you still need financial assistance, you can renew your access before it expires.
          </p>
          
          ${renewalNote30}
          
          <div style="text-align: center; margin: 32px 0;">
            ${getButton('Renew Assisted Access', `${siteUrl}/dashboard`, '#00A6A6')}
          </div>
          
          <div style="background: #F3FBFA; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <strong>💛 If your situation has improved</strong>
            </p>
            <p style="margin: 0; font-size: 14px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              If you can now afford the $7.99/month Alert Service, we'd appreciate you upgrading. Your paid subscription helps us continue offering Assisted Access to others who need it.
            </p>
          </div>
          
          <p style="margin: 24px 0 0 0; font-size: 14px; color: #666; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Questions? Reply to this email or visit your dashboard for more options.
          </p>
        `;
        
        const html30 = buildEmail({
          headerTitle: 'Assisted Access Reminder',
          headerSubtitle: 'Your access expires in 30 days',
          bodyContent: bodyContent30,
          siteUrl,
          includeUnsubscribe: false,
        });
        
        await resend.emails.send({
          from: DEFAULT_EMAIL_OPTIONS.from!,
          reply_to: DEFAULT_EMAIL_OPTIONS.replyTo!,
          to: [user.email],
          subject: "Your Assisted Access expires in 30 days",
          html: html30,
        });
        
        remindersSent++;
      }
      
      // Send 7-day reminder
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 5) {
        logStep("Sending 7-day reminder", { email: user.email, daysUntilExpiry });
        
        const expiryCard7 = getCard(`
          <div style="text-align: center; padding: 12px 0;">
            <div style="font-size: 48px; margin-bottom: 12px;">⚠️</div>
            <h2 style="margin: 0 0 8px 0; color: #F4A261; font-size: 24px; font-family: Georgia, 'Times New Roman', serif;">7 Days Until Expiry</h2>
            <p style="margin: 0; color: #666; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              Your Assisted Access expires on ${expiryDate.toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        `, '#F4A261');
        
        const optionsCard7 = getCard(`
          <h3 style="margin: 0 0 16px 0; color: #0F4C5C; font-size: 18px; font-family: Georgia, 'Times New Roman', serif;">Your Options</h3>
          <ul style="margin: 0; padding: 0; list-style: none;">
            <li style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <strong style="color: #0F4C5C;">Renew Assisted Access</strong><br/>
              <span style="color: #666; font-size: 14px;">If you still need financial assistance</span>
            </li>
            <li style="padding: 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <strong style="color: #0F4C5C;">Subscribe to Alert Service</strong><br/>
              <span style="color: #666; font-size: 14px;">$7.99/month with no commitment</span>
            </li>
          </ul>
        `, '#FFF3CD');
        
        const bodyContent7 = `
          ${expiryCard7}
          
          <p style="margin: 24px 0; font-size: 16px; color: #333; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Hi there,
          </p>
          
          <p style="margin: 0 0 24px 0; font-size: 16px; color: #333; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Your Assisted Access expires in <strong>7 days</strong>. After ${expiryDate.toLocaleDateString("en-CA", { month: "long", day: "numeric" })}, you won't receive doctor alerts unless you renew or subscribe.
          </p>
          
          ${optionsCard7}
          
          <div style="text-align: center; margin: 32px 0;">
            ${getButton('Renew Now', `${siteUrl}/dashboard`, '#F4A261')}
          </div>
          
          <p style="margin: 24px 0 0 0; font-size: 14px; color: #666; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Questions? Reply to this email anytime.
          </p>
        `;
        
        const html7 = buildEmail({
          headerTitle: '⚠️ Expiring Soon!',
          headerSubtitle: 'Your access expires in 7 days',
          bodyContent: bodyContent7,
          siteUrl,
          includeUnsubscribe: false,
        });
        
        await resend.emails.send({
          from: DEFAULT_EMAIL_OPTIONS.from!,
          reply_to: DEFAULT_EMAIL_OPTIONS.replyTo!,
          to: [user.email],
          subject: "⚠️ Your Assisted Access expires in 7 days",
          html: html7,
        });
        
        remindersSent++;
      }

      // Handle expired access
      if (daysUntilExpiry <= 0) {
        logStep("Access expired, downgrading user", { email: user.email });
        
        await supabaseClient
          .from("profiles")
          .update({ status: "free" })
          .eq("user_id", user.user_id);

        const expiredCard = getCard(`
          <div style="text-align: center; padding: 12px 0;">
            <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
            <h2 style="margin: 0 0 8px 0; color: #6b7280; font-size: 24px; font-family: Georgia, 'Times New Roman', serif;">Your Access Has Expired</h2>
            <p style="margin: 0; color: #666; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              Assisted Access ended on ${expiryDate.toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        `, '#6b7280');
        
        const optionsCardExpired = getCard(`
          <h3 style="margin: 0 0 16px 0; color: #0F4C5C; font-size: 18px; font-family: Georgia, 'Times New Roman', serif;">Continue Receiving Alerts</h3>
          <ul style="margin: 0; padding: 0; list-style: none;">
            <li style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <strong style="color: #0F4C5C;"><a href="${siteUrl}/assisted-access" style="color: #0F4C5C; text-decoration: none;">Reapply for Assisted Access</a></strong><br/>
              <span style="color: #666; font-size: 14px;">If you still need financial assistance</span>
            </li>
            <li style="padding: 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <strong style="color: #0F4C5C;"><a href="${siteUrl}/pricing" style="color: #0F4C5C; text-decoration: none;">Subscribe to Alert Service</a></strong><br/>
              <span style="color: #666; font-size: 14px;">$7.99/month, cancel anytime</span>
            </li>
          </ul>
        `, '#f8f9fa');
        
        const bodyContentExpired = `
          ${expiredCard}
          
          <p style="margin: 24px 0; font-size: 16px; color: #333; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Hi there,
          </p>
          
          <p style="margin: 0 0 24px 0; font-size: 16px; color: #333; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Your Assisted Access has expired. You can still use FindYourDoctor.ca to search for doctors, but you won't receive email alerts when doctors start accepting patients.
          </p>
          
          ${optionsCardExpired}
          
          <div style="background: #F3FBFA; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; color: #666; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <strong>Always Free:</strong> Search our doctor database anytime at <a href="${siteUrl}/doctors" style="color: #00A6A6; text-decoration: none;">findyourdoctor.ca/doctors</a>
            </p>
          </div>
          
          <p style="margin: 24px 0 0 0; font-size: 14px; color: #666; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <em>Thank you for using FindYourDoctor.ca. We hope you found the care you were looking for!</em>
          </p>
        `;
        
        const htmlExpired = buildEmail({
          headerTitle: 'Access Expired',
          headerSubtitle: 'Your Assisted Access has ended',
          bodyContent: bodyContentExpired,
          siteUrl,
          includeUnsubscribe: false,
        });
        
        await resend.emails.send({
          from: DEFAULT_EMAIL_OPTIONS.from!,
          reply_to: DEFAULT_EMAIL_OPTIONS.replyTo!,
          to: [user.email],
          subject: "Your Assisted Access has expired",
          html: htmlExpired,
        });
        
        remindersSent++;
      }
    }

    logStep("Completed", { remindersSent });

    return new Response(JSON.stringify({ 
      success: true, 
      remindersSent,
      usersChecked: users?.length || 0
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
