import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    
    const emailResponse = await resend.emails.send({
      from: "FindYourDoctor <alerts@findyourdoctor.ca>",
      to: [recipientEmail],
      subject: `🎉 Doctor Alert: ${doctorName} is now accepting patients in ${city}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00857C 0%, #00A6A6 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Great News!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              A doctor near ${recipientCity} is now accepting patients
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none;">
            <div style="background: white; padding: 24px; border-radius: 8px; border-left: 4px solid #22c55e;">
              <h2 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 20px;">${doctorName}</h2>
              <p style="margin: 0 0 16px 0; color: #666; font-size: 16px;">${clinicName}</p>
              
              <div style="margin-bottom: 16px;">
                <p style="margin: 0; font-size: 14px; color: #666;">📍 ${address}, ${city}</p>
              </div>
              
              <a href="tel:${phone.replace(/[^0-9]/g, "")}" style="display: inline-block; background: #00857C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                📞 Call Now: ${phone}
              </a>
            </div>
            
            <p style="margin: 24px 0 0 0; font-size: 14px; color: #666;">
              <strong>⚡ Act fast!</strong> Doctors fill up quickly. We recommend calling immediately.
            </p>
            
            <a href="${siteUrl}/doctors/${doctorId}" style="display: inline-block; margin-top: 16px; color: #00857C; font-size: 14px;">
              View Full Details →
            </a>
          </div>
          
          <div style="padding: 20px; text-align: center; font-size: 12px; color: #999;">
            <p>You're receiving this because you have alerts set for ${recipientCity}.</p>
            <p>
              <a href="${siteUrl}/dashboard" style="color: #00857C;">Manage your alerts</a> | 
              <a href="${siteUrl}" style="color: #00857C;">FindYourDoctor.ca</a>
            </p>
          </div>
        </body>
        </html>
      `,
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
