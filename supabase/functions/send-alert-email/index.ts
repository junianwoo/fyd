import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { buildEmail, getCard, getPhoneButton, ALERT_EMAIL_OPTIONS } from "../_shared/email-templates.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-ALERT-EMAIL] ${step}${detailsStr}`);
};

interface AlertEmailRequest {
  doctorId: string;
  doctorName: string;
  clinicName: string;
  city: string;
  phone: string;
  address: string;
  recipientEmail: string;
  recipientCity: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { 
      doctorId, 
      doctorName, 
      clinicName, 
      city, 
      phone, 
      address, 
      recipientEmail,
      recipientCity 
    }: AlertEmailRequest = await req.json();

    logStep("Sending alert email", { recipientEmail, doctorName, city });

    const siteUrl = Deno.env.get("SITE_URL") || "https://findyourdoctor.ca";
    
    // Build email body content
    const doctorCard = getCard(`
      <h2 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 22px; font-family: Georgia, 'Times New Roman', serif;">${doctorName}</h2>
      <p style="margin: 0 0 16px 0; color: #666; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${clinicName}</p>
      
      <div style="margin-bottom: 20px;">
        <p style="margin: 0 0 4px 0; font-size: 15px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          📍 ${address}, ${city}
        </p>
      </div>
      
      ${getPhoneButton(phone, phone)}
      
      <div style="margin-top: 16px;">
        <a href="${siteUrl}/doctors/${doctorId}" style="color: #00A6A6; font-size: 14px; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          View Full Details →
        </a>
      </div>
    `, '#2ECC71');
    
    const bodyContent = `
      ${doctorCard}
      
      <div style="background: #FEF3C7; border-left: 4px solid #F4A261; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0; font-size: 15px; color: #92400E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <strong>⚡ Act fast!</strong> Doctors fill up quickly. We recommend calling as soon as possible to secure your spot.
        </p>
      </div>
      
      <p style="margin: 16px 0 0 0; font-size: 13px; color: #999; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        You're receiving this because you have alerts set for ${recipientCity}.
      </p>
    `;
    
    const html = buildEmail({
      headerTitle: '🎉 Great News!',
      headerSubtitle: `A doctor near ${recipientCity} is now accepting patients`,
      bodyContent,
      siteUrl,
      includeUnsubscribe: true,
    });
    
    const emailResponse = await resend.emails.send({
      from: ALERT_EMAIL_OPTIONS.from!,
      replyTo: ALERT_EMAIL_OPTIONS.replyTo!,
      to: [recipientEmail],
      subject: `🎉 Doctor Alert: ${doctorName} is now accepting patients in ${city}!`,
      html,
    });

    logStep("Email sent successfully", { data: emailResponse.data });

    return new Response(JSON.stringify({ success: true, data: emailResponse.data }), {
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
