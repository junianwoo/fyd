import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { buildEmail, getCard, DEFAULT_EMAIL_OPTIONS } from "../_shared/email-templates.ts";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-CONTACT-EMAIL] ${step}${detailsStr}`);
};

interface ContactEmailRequest {
  name?: string;
  email: string;
  subject?: string;
  message: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { name, email, subject, message }: ContactEmailRequest = await req.json();
    
    if (!email || !message) {
      throw new Error("Email and message are required");
    }

    logStep("Processing contact form submission", { email, hasName: !!name, hasSubject: !!subject });

    const siteUrl = Deno.env.get("SITE_URL") || "https://findyourdoctor.ca";
    const supportEmail = "support@findyourdoctor.ca";
    
    // Build email content for support team
    const contactCard = getCard(`
      <h2 style="margin: 0 0 16px 0; color: #0F4C5C; font-size: 22px; font-family: Georgia, 'Times New Roman', serif;">
        New Contact Form Submission
      </h2>
      
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <strong>From:</strong> ${name || 'Anonymous'} (${email})
        </p>
        ${subject ? `
        <p style="margin: 0; font-size: 14px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <strong>Subject:</strong> ${subject}
        </p>
        ` : ''}
      </div>
      
      <div style="background: #ffffff; border-left: 4px solid #00A6A6; padding: 16px; margin-top: 16px;">
        <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Message:
        </p>
        <p style="margin: 0; font-size: 15px; color: #333; line-height: 1.6; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ${message}
        </p>
      </div>
      
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 13px; color: #999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <strong>Reply to:</strong> ${email}
        </p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Submitted from: ${siteUrl}/contact
        </p>
      </div>
    `, '#E8F5E9');
    
    const bodyContent = `
      ${contactCard}
      
      <div style="text-align: center; margin-top: 24px;">
        <p style="margin: 0; font-size: 13px; color: #999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Reply directly to this email to respond to ${name || 'the sender'}
        </p>
      </div>
    `;

    const htmlContent = buildEmail({
      headerTitle: "New Contact Form Message",
      headerSubtitle: `From ${name || email}`,
      bodyContent,
      siteUrl,
      includeUnsubscribe: false
    });

    // Send email to support team
    logStep("Sending email to support team");
    
    const { data, error } = await resend.emails.send({
      from: "FindYourDoctor <no-reply@findyourdoctor.ca>",
      to: supportEmail,
      subject: subject ? `Contact Form: ${subject}` : `Contact Form Message from ${name || email}`,
      html: htmlContent,
      reply_to: email, // Allow support team to reply directly
    });

    if (error) {
      logStep("Error sending email", { error: error.message });
      throw new Error(`Failed to send email: ${error.message}`);
    }

    logStep("Email sent successfully", { messageId: data?.id });

    // Send auto-reply to user
    const autoReplyCard = getCard(`
      <h2 style="margin: 0 0 16px 0; color: #0F4C5C; font-size: 22px; font-family: Georgia, 'Times New Roman', serif;">
        Thank You for Contacting Us
      </h2>
      
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #333; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Hi ${name || 'there'},
      </p>
      
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #333; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        We've received your message and will get back to you as soon as possible. Our team typically responds within 1-2 business days.
      </p>
      
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Your Message:
        </p>
        <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ${message.length > 200 ? message.substring(0, 200) + '...' : message}
        </p>
      </div>
    `, '#E8F5E9');

    const autoReplyContent = `
      ${autoReplyCard}
      
      <div style="text-align: center; margin-top: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          In the meantime, you can:
        </p>
        <p style="margin: 0;">
          <a href="${siteUrl}/faq" style="color: #00A6A6; text-decoration: none; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Check our FAQ →
          </a>
        </p>
      </div>
    `;

    const autoReplyHtml = buildEmail({
      headerTitle: "Message Received",
      headerSubtitle: "We'll get back to you shortly",
      bodyContent: autoReplyContent,
      siteUrl,
      includeUnsubscribe: false
    });

    // Send auto-reply (don't fail if this fails)
    try {
      logStep("Sending auto-reply to user");
      await resend.emails.send({
        from: "FindYourDoctor <no-reply@findyourdoctor.ca>",
        to: email,
        subject: "We've Received Your Message - FindYourDoctor",
        html: autoReplyHtml,
        reply_to: supportEmail,
      });
      logStep("Auto-reply sent successfully");
    } catch (autoReplyError) {
      logStep("Auto-reply failed (non-critical)", { error: autoReplyError });
      // Don't throw - main email was sent successfully
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Message sent successfully" 
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
