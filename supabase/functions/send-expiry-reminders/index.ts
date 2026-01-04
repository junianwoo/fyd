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
        
        await resend.emails.send({
          from: "FindYourDoctor <support@findyourdoctor.ca>",
          to: [user.email],
          subject: "Your Assisted Access expires in 30 days",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #0F4C5C; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Assisted Access Reminder</h1>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none;">
                <p style="font-size: 16px;">Hi there,</p>
                
                <p style="font-size: 16px;">
                  Your Assisted Access subscription expires in <strong>30 days</strong> 
                  (${expiryDate.toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}).
                </p>
                
                <p style="font-size: 16px;">
                  If you still need financial assistance, you can renew your access before it expires.
                  ${user.assisted_renewed_count && user.assisted_renewed_count >= 2 
                    ? "Note: You've renewed twice already. Further renewals may require review." 
                    : ""}
                </p>
                
                <div style="margin: 24px 0; text-align: center;">
                  <a href="${siteUrl}/dashboard" style="display: inline-block; background: #0F4C5C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Go to Dashboard
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                  If your financial situation has improved, consider our Alert Service at $7.99/month 
                  to continue receiving doctor alerts.
                </p>
              </div>
              
              <div style="padding: 20px; text-align: center; font-size: 12px; color: #999;">
                <p><a href="${siteUrl}" style="color: #00A6A6;">FindYourDoctor.ca</a></p>
              </div>
            </body>
            </html>
          `,
        });
        
        remindersSent++;
      }
      
      // Send 7-day reminder
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 5) {
        logStep("Sending 7-day reminder", { email: user.email, daysUntilExpiry });
        
        await resend.emails.send({
          from: "FindYourDoctor <support@findyourdoctor.ca>",
          to: [user.email],
          subject: "⚠️ Your Assisted Access expires in 7 days",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #F4A261; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Expiring Soon!</h1>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none;">
                <p style="font-size: 16px;">Hi there,</p>
                
                <p style="font-size: 16px;">
                  Your Assisted Access expires in <strong>7 days</strong>. 
                  After ${expiryDate.toLocaleDateString("en-CA", { month: "long", day: "numeric" })}, 
                  you won't receive doctor alerts.
                </p>
                
                <div style="background: #fff3cd; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <p style="margin: 0; font-size: 14px;">
                    <strong>Options:</strong><br>
                    • Renew Assisted Access (if still needed)<br>
                    • Subscribe to Alert Service ($7.99/month)
                  </p>
                </div>
                
                <div style="margin: 24px 0; text-align: center;">
                  <a href="${siteUrl}/dashboard" style="display: inline-block; background: #F4A261; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Renew Now
                  </a>
                </div>
              </div>
              
              <div style="padding: 20px; text-align: center; font-size: 12px; color: #999;">
                <p><a href="${siteUrl}" style="color: #00A6A6;">FindYourDoctor.ca</a></p>
              </div>
            </body>
            </html>
          `,
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

        await resend.emails.send({
          from: "FindYourDoctor <support@findyourdoctor.ca>",
          to: [user.email],
          subject: "Your Assisted Access has expired",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #6b7280; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Access Expired</h1>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none;">
                <p style="font-size: 16px;">Hi there,</p>
                
                <p style="font-size: 16px;">
                  Your Assisted Access has expired. You can still use FindYourDoctor.ca to search for doctors, 
                  but you won't receive email alerts.
                </p>
                
                <p style="font-size: 16px;">
                  To continue receiving alerts when doctors near you start accepting patients:
                </p>
                
                <ul style="font-size: 14px;">
                  <li><a href="${siteUrl}/assisted-access" style="color: #00A6A6;">Reapply for Assisted Access</a> (if still needed)</li>
                  <li><a href="${siteUrl}/pricing" style="color: #00A6A6;">Subscribe to Alert Service</a> ($7.99/month)</li>
                </ul>
                
                <p style="font-size: 14px; color: #666;">
                  Thank you for using FindYourDoctor.ca. We hope you found what you were looking for!
                </p>
              </div>
              
              <div style="padding: 20px; text-align: center; font-size: 12px; color: #999;">
                <p><a href="${siteUrl}" style="color: #00A6A6;">FindYourDoctor.ca</a></p>
              </div>
            </body>
            </html>
          `,
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
