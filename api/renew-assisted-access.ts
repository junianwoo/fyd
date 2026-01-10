import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const userId = req.query.userId as string || req.body?.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('[RENEW-ASSISTED-ACCESS] Processing renewal for user:', userId);

    // Create Supabase admin client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[RENEW-ASSISTED-ACCESS] Missing environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      { auth: { persistSession: false } }
    );

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, status, assisted_renewed_count, assisted_expires_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error('[RENEW-ASSISTED-ACCESS] Profile not found:', profileError);
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (profile.status !== 'assisted_access') {
      console.error('[RENEW-ASSISTED-ACCESS] User is not on Assisted Access');
      return res.status(400).json({ error: 'User is not on Assisted Access plan' });
    }

    // Calculate new expiry date (6 months from now)
    const newExpiryDate = new Date();
    newExpiryDate.setMonth(newExpiryDate.getMonth() + 6);

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        assisted_expires_at: newExpiryDate.toISOString(),
        assisted_renewed_count: (profile.assisted_renewed_count || 0) + 1,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('[RENEW-ASSISTED-ACCESS] Update error:', updateError);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    console.log('[RENEW-ASSISTED-ACCESS] Renewal successful', { 
      userId, 
      newExpiryDate: newExpiryDate.toISOString() 
    });

    // Send branded confirmation email via Resend
    try {
      const siteUrl = process.env.SITE_URL || 'https://findyourdoctor.ca';
      const formattedExpiryDate = newExpiryDate.toLocaleDateString('en-CA', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });

      // Build branded email HTML
      const successCard = `
        <div style="background: white; padding: 24px; border-radius: 8px; border-left: 4px solid #2ECC71; margin: 16px 0;">
          <div style="text-align: center; padding: 12px 0;">
            <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
            <h2 style="margin: 0 0 8px 0; color: #2ECC71; font-size: 24px; font-family: Georgia, 'Times New Roman', serif;">Access Renewed!</h2>
            <p style="margin: 0; color: #666; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              Your Assisted Access has been extended for another 6 months
            </p>
          </div>
        </div>
      `;

      const expiryInfo = `
        <div style="background: #F3FBFA; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <strong>Your new expiry date</strong>
          </p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #0F4C5C; font-family: Georgia, 'Times New Roman', serif;">
            ${formattedExpiryDate}
          </p>
        </div>
      `;

      const dashboardButton = `
        <div style="text-align: center; margin: 32px 0;">
          <a href="${siteUrl}/dashboard" style="display: inline-block; background: #00A6A6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 8px 0;">
            Go to Dashboard
          </a>
        </div>
      `;

      const upgradeNote = `
        <div style="background: #FEF3E5; padding: 16px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #F4A261;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #92400E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <strong>💛 Thank You for Being Part of Our Community</strong>
          </p>
          <p style="margin: 0; font-size: 14px; color: #92400E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            If your financial situation improves, please consider upgrading to our <a href="${siteUrl}/pricing" style="color: #0F4C5C; text-decoration: underline;">paid Alert Service</a>. Your subscription helps us continue offering Assisted Access to others who need it.
          </p>
        </div>
      `;

      const bodyContent = `
        ${successCard}
        
        <p style="margin: 24px 0; font-size: 16px; color: #333; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Hi there,
        </p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #333; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Your Assisted Access to FindYourDoctor.ca has been successfully renewed! You can continue to receive instant email alerts when doctors near you start accepting new patients.
        </p>
        
        ${expiryInfo}
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 24px 0;">
          <h3 style="margin: 0 0 12px 0; color: #0F4C5C; font-size: 16px; font-family: Georgia, 'Times New Roman', serif;">What's Next?</h3>
          <ul style="margin: 0; padding: 0 0 0 20px; color: #666; font-size: 14px; line-height: 1.8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <li>Your alert settings remain active and unchanged</li>
            <li>You'll receive a reminder 30 days before your next expiry</li>
            <li>Continue searching for doctors in your area</li>
          </ul>
        </div>
        
        ${dashboardButton}
        ${upgradeNote}
        
        <p style="margin: 24px 0 0 0; font-size: 14px; color: #666; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Questions? Reply to this email anytime.
        </p>
      `;

      // Note: We need to inline the buildEmail function here since we can't import from Supabase functions
      const emailHeader = `
        <div style="background: linear-gradient(135deg, #0F4C5C 0%, #00A6A6 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <div style="margin-bottom: 20px;">
            <img src="${siteUrl}/logo-white.png" alt="FindYourDoctor" style="height: 50px; width: auto;" />
          </div>
          <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px; font-weight: 600; font-family: Georgia, 'Times New Roman', serif;">Assisted Access Renewed</h1>
          <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Your access has been extended for 6 more months</p>
        </div>
      `;

      const emailFooter = `
        <div style="background: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <strong>Questions?</strong> Reply to this email or visit our <a href="${siteUrl}/contact" style="color: #00A6A6; text-decoration: none;">contact page</a>
          </p>
          <p style="margin: 0 0 16px 0; font-size: 13px; color: #999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <a href="${siteUrl}/dashboard" style="color: #00A6A6; text-decoration: none; margin: 0 8px;">Dashboard</a> •
            <a href="${siteUrl}/privacy" style="color: #00A6A6; text-decoration: none; margin: 0 8px;">Privacy Policy</a> •
            <a href="${siteUrl}/terms" style="color: #00A6A6; text-decoration: none; margin: 0 8px;">Terms</a>
          </p>
          <p style="margin: 0; font-size: 12px; color: #999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            © ${new Date().getFullYear()} FindYourDoctor. Helping Ontarians find family doctors.
          </p>
        </div>
      `;

      const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>FindYourDoctor</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 0;">
                      ${emailHeader}
                      <div style="padding: 30px;">
                        ${bodyContent}
                      </div>
                      ${emailFooter}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'FindYourDoctor <no-reply@findyourdoctor.ca>',
          to: profile.email,
          subject: '🎉 Your Assisted Access has been renewed!',
          html: fullHtml,
          reply_to: 'support@findyourdoctor.ca',
        }),
      });

      if (!resendResponse.ok) {
        console.error('[RENEW-ASSISTED-ACCESS] Failed to send confirmation email');
      } else {
        console.log('[RENEW-ASSISTED-ACCESS] Confirmation email sent successfully');
      }
    } catch (emailError) {
      console.error('[RENEW-ASSISTED-ACCESS] Email error:', emailError);
      // Don't fail the renewal if email fails
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Assisted Access renewed successfully',
      newExpiryDate: newExpiryDate.toISOString()
    });

  } catch (error: any) {
    console.error('[RENEW-ASSISTED-ACCESS] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
