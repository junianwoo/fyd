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

    // Debug logging
    console.log('[RENEW-ASSISTED-ACCESS] Env check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlSource: process.env.SUPABASE_URL ? 'SUPABASE_URL' : (process.env.VITE_SUPABASE_URL ? 'VITE_SUPABASE_URL' : 'none'),
      availableKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error('[RENEW-ASSISTED-ACCESS] Missing env vars');
      return res.status(500).json({ 
        error: 'Server configuration error',
        debug: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          availableEnvKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
        }
      });
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

    // Send confirmation email via Resend
    try {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'FindYourDoctor <no-reply@findyourdoctor.ca>',
          to: profile.email,
          subject: 'Your Assisted Access has been renewed!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #0F4C5C;">🎉 Access Renewed!</h1>
              <p>Hi there,</p>
              <p>Your Assisted Access to FindYourDoctor.ca has been successfully renewed for another 6 months!</p>
              <p><strong>Your new expiry date:</strong> ${newExpiryDate.toLocaleDateString('en-CA', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}</p>
              <p>You can continue to receive instant doctor alerts.</p>
              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.SITE_URL || 'https://findyourdoctor.ca'}/dashboard" 
                   style="background: #00A6A6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Go to Dashboard
                </a>
              </p>
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Questions? Reply to this email anytime.
              </p>
            </div>
          `,
        }),
      });

      if (!resendResponse.ok) {
        console.error('[RENEW-ASSISTED-ACCESS] Failed to send confirmation email');
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
