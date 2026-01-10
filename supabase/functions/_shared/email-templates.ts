/**
 * Branded Email Templates for FindYourDoctor
 * 
 * Brand Colors:
 * - Primary: #0F4C5C (Deep teal)
 * - Secondary: #00A6A6 (Bright teal)
 * - Accent: #F4A261 (Warm orange)
 * - Success: #2ECC71 (Green)
 */

export interface EmailOptions {
  replyTo?: string;
  from?: string;
}

/**
 * Generate email header with logo and gradient background
 */
export function getEmailHeader(title: string, subtitle?: string, siteUrl?: string): string {
  const logoUrl = siteUrl ? `${siteUrl}/logo-white.png` : 'https://findyourdoctor-tan.vercel.app/logo-white.png';
  return `
    <div style="background: linear-gradient(135deg, #0F4C5C 0%, #00A6A6 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <!-- Logo - Using public URL that will be hosted -->
      <div style="margin-bottom: 20px;">
        <img src="${logoUrl}" alt="FindYourDoctor" style="height: 50px; width: auto;" />
      </div>
      <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px; font-weight: 600; font-family: Georgia, 'Times New Roman', serif;">${title}</h1>
      ${subtitle ? `<p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${subtitle}</p>` : ''}
    </div>
  `;
}

/**
 * Generate email footer with links
 */
export function getEmailFooter(siteUrl: string, includeUnsubscribe: boolean = true): string {
  return `
    <div style="background: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <strong>Questions?</strong> Reply to this email or visit our <a href="${siteUrl}/contact" style="color: #00A6A6; text-decoration: none;">contact page</a>
      </p>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <a href="${siteUrl}/dashboard" style="color: #00A6A6; text-decoration: none; margin: 0 8px;">Dashboard</a> •
        <a href="${siteUrl}/privacy" style="color: #00A6A6; text-decoration: none; margin: 0 8px;">Privacy Policy</a> •
        <a href="${siteUrl}/terms" style="color: #00A6A6; text-decoration: none; margin: 0 8px;">Terms</a>
        ${includeUnsubscribe ? ` • <a href="${siteUrl}/dashboard" style="color: #00A6A6; text-decoration: none; margin: 0 8px;">Manage Alerts</a>` : ''}
      </p>
      <p style="margin: 0; font-size: 12px; color: #999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        © ${new Date().getFullYear()} FindYourDoctor. Helping Ontarians find family doctors.
      </p>
    </div>
  `;
}

/**
 * Generate a styled button
 */
export function getButton(text: string, url: string, color: string = '#00A6A6'): string {
  return `
    <a href="${url}" style="display: inline-block; background: ${color}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 8px 0;">
      ${text}
    </a>
  `;
}

/**
 * Generate a phone call button
 */
export function getPhoneButton(phoneNumber: string, displayNumber: string): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  return `
    <a href="tel:${cleanPhone}" style="display: inline-block; background: #00A6A6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      📞 Call Now: ${displayNumber}
    </a>
  `;
}

/**
 * Generate a card/box component
 */
export function getCard(content: string, borderColor: string = '#e9ecef'): string {
  return `
    <div style="background: white; padding: 24px; border-radius: 8px; border-left: 4px solid ${borderColor}; margin: 16px 0;">
      ${content}
    </div>
  `;
}

/**
 * Generate an info box
 */
export function getInfoBox(content: string, backgroundColor: string = '#f8f9fa'): string {
  return `
    <div style="background: ${backgroundColor}; padding: 20px; border-radius: 8px; margin: 16px 0;">
      ${content}
    </div>
  `;
}

/**
 * Base email template wrapper
 */
export function wrapEmailTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>FindYourDoctor</title>
      <!--[if mso]>
      <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
      </style>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 0;">
                  ${content}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Generate full email HTML from components
 */
export function buildEmail(options: {
  headerTitle: string;
  headerSubtitle?: string;
  bodyContent: string;
  siteUrl: string;
  includeUnsubscribe?: boolean;
}): string {
  const { headerTitle, headerSubtitle, bodyContent, siteUrl, includeUnsubscribe = true } = options;
  
  const content = `
    ${getEmailHeader(headerTitle, headerSubtitle, siteUrl)}
    <div style="padding: 30px;">
      ${bodyContent}
    </div>
    ${getEmailFooter(siteUrl, includeUnsubscribe)}
  `;
  
  return wrapEmailTemplate(content);
}

/**
 * Default email options
 */
export const DEFAULT_EMAIL_OPTIONS: EmailOptions = {
  replyTo: 'support@findyourdoctor.ca',
  from: 'FindYourDoctor <no-reply@findyourdoctor.ca>',
};

/**
 * Email options for alerts
 */
export const ALERT_EMAIL_OPTIONS: EmailOptions = {
  replyTo: 'support@findyourdoctor.ca',
  from: 'FindYourDoctor Alerts <alerts@findyourdoctor.ca>',
};
