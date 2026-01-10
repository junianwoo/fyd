import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify this is a cron request (or allow manual trigger for testing)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && req.query.manual !== 'true') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('[SEND-EXPIRY-REMINDERS] Starting expiry reminder check');

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const siteUrl = process.env.SITE_URL || 'https://findyourdoctor.ca';

    // Get all assisted access users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, email, assisted_expires_at, assisted_renewed_count')
      .eq('status', 'assisted_access')
      .not('assisted_expires_at', 'is', null);

    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }

    console.log('[SEND-EXPIRY-REMINDERS] Found assisted access users:', users?.length || 0);

    let remindersSent = 0;

    for (const user of users || []) {
      if (!user.assisted_expires_at) continue;

      const expiryDate = new Date(user.assisted_expires_at);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      console.log('[SEND-EXPIRY-REMINDERS] Checking user:', { 
        email: user.email, 
        daysUntilExpiry 
      });

      const renewalUrl = `${siteUrl}/api/renew-assisted-access?userId=${user.user_id}`;

      // Send 30-day reminder
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 28) {
        await sendReminderEmail(user.email, '30-day', expiryDate, renewalUrl);
        remindersSent++;
      }

      // Send 7-day reminder
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 5) {
        await sendReminderEmail(user.email, '7-day', expiryDate, renewalUrl);
        remindersSent++;
      }

      // Send expired notice and downgrade to free
      if (daysUntilExpiry <= 0) {
        await sendExpiredEmail(user.email, siteUrl);
        
        // Downgrade to free
        await supabase
          .from('profiles')
          .update({ status: 'free' })
          .eq('user_id', user.user_id);
        
        remindersSent++;
        console.log('[SEND-EXPIRY-REMINDERS] User expired and downgraded:', user.email);
      }
    }

    console.log('[SEND-EXPIRY-REMINDERS] Complete. Reminders sent:', remindersSent);

    return res.status(200).json({
      success: true,
      message: `Checked ${users?.length || 0} users, sent ${remindersSent} reminders`
    });

  } catch (error: any) {
    console.error('[SEND-EXPIRY-REMINDERS] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function sendReminderEmail(
  email: string,
  type: '30-day' | '7-day',
  expiryDate: Date,
  renewalUrl: string
) {
  const formattedDate = expiryDate.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subject = type === '30-day' 
    ? 'Your Assisted Access expires in 30 days'
    : 'Reminder: Your Assisted Access expires in 7 days';

  const emoji = type === '30-day' ? '⏰' : '⚠️';
  const urgency = type === '30-day' ? 'in 30 days' : 'in just 7 days';
  const color = type === '30-day' ? '#00A6A6' : '#F4A261';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0F4C5C 0%, #00A6A6 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${emoji} Access Expiring Soon</h1>
      </div>
      
      <div style="padding: 30px; background: white;">
        <p>Hi there,</p>
        
        <p>Your Assisted Access to FindYourDoctor.ca expires <strong>${urgency}</strong> on <strong>${formattedDate}</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color};">
          <p style="margin: 0; font-size: 16px; color: #333;">
            <strong>One-click renewal:</strong> Click the button below to extend your access for another 6 months.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${renewalUrl}" style="background: ${color}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
            Renew My Access
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          If your situation has changed and you no longer need Assisted Access, no action is required. You can reapply anytime at <a href="${process.env.SITE_URL}/assisted-access">findyourdoctor.ca/assisted-access</a>.
        </p>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Questions? Just reply to this email.
        </p>
      </div>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'FindYourDoctor <no-reply@findyourdoctor.ca>',
      to: email,
      subject: subject,
      html: html,
      reply_to: 'support@findyourdoctor.ca',
    }),
  });

  console.log(`[SEND-EXPIRY-REMINDERS] Sent ${type} reminder to:`, email);
}

async function sendExpiredEmail(email: string, siteUrl: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0F4C5C 0%, #00A6A6 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Your Assisted Access Has Expired</h1>
      </div>
      
      <div style="padding: 30px; background: white;">
        <p>Hi there,</p>
        
        <p>Your Assisted Access to FindYourDoctor.ca has expired.</p>
        
        <p>If you still need support finding a family doctor, you can:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;">
            <strong style="color: #0F4C5C;">✓ Reapply for Assisted Access</strong><br/>
            <span style="color: #666;">If you're still facing financial barriers</span>
          </p>
          <p style="margin: 10px 0 0 0;">
            <strong style="color: #0F4C5C;">✓ Upgrade to Paid Alert Service</strong><br/>
            <span style="color: #666;">Only $7.99/month to support the service</span>
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${siteUrl}/assisted-access" style="background: #00A6A6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; margin: 5px;">
            Reapply for Assisted Access
          </a>
          <a href="${siteUrl}/pricing" style="background: #0F4C5C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; margin: 5px;">
            View Paid Plans
          </a>
        </div>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          You can still search for doctors on FindYourDoctor.ca for free. Email alerts are only available with Assisted Access or a paid subscription.
        </p>
      </div>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'FindYourDoctor <no-reply@findyourdoctor.ca>',
      to: email,
      subject: 'Your Assisted Access Has Expired',
      html: html,
      reply_to: 'support@findyourdoctor.ca',
    }),
  });

  console.log('[SEND-EXPIRY-REMINDERS] Sent expired notice to:', email);
}
