# Email Testing Guide

This guide will help you test all the branded email templates that have been implemented with Resend.

## Prerequisites

- [ ] `RESEND_API_KEY` is configured in Supabase Edge Functions secrets
- [ ] `alerts@findyourdoctor.ca` is verified in Resend
- [ ] `no-reply@findyourdoctor.ca` is verified in Resend
- [ ] `support@findyourdoctor.ca` is set up in Zoho Mail (for receiving replies)
- [ ] You have access to test email accounts

## Email Templates to Test

### 1. Doctor Alert Emails

**Functions**: `send-alert-email`, `run-alert-engine`  
**Sender**: `alerts@findyourdoctor.ca`  
**Reply-To**: `support@findyourdoctor.ca`

#### Test via Direct Function Call:
```bash
curl -X POST https://vktbkehoymmgvrjujjka.supabase.co/functions/v1/send-alert-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "doctorId": "test-123",
    "doctorName": "Dr. Jane Smith",
    "clinicName": "Downtown Medical Clinic",
    "city": "Toronto",
    "phone": "416-555-0100",
    "address": "123 Main Street",
    "recipientEmail": "your-test@example.com",
    "recipientCity": "Toronto"
  }'
```

#### Test via Alert Engine (End-to-End):
1. Create a test alert for a specific location
2. Add a doctor to that location with `accepting_status = 'accepting'`
3. Trigger the `run-alert-engine` function manually or wait for the scheduled run

#### What to Check:
- [ ] Email arrives from `alerts@findyourdoctor.ca`
- [ ] Reply-To header is `support@findyourdoctor.ca`
- [ ] Logo displays correctly
- [ ] Branded header with teal gradient
- [ ] Doctor information card with green border
- [ ] Phone button works on mobile
- [ ] "Act fast" warning box displays
- [ ] Footer links work
- [ ] Email renders well on Gmail, Outlook, Apple Mail

---

### 2. Assisted Access Welcome Email

**Function**: `send-assisted-access-welcome`  
**Sender**: `no-reply@findyourdoctor.ca`  
**Reply-To**: `support@findyourdoctor.ca`

#### Test via Frontend:
1. Go to `/assisted-access`
2. Fill out the application form with a test email
3. Submit the application

#### Test via Direct Function Call:
```bash
curl -X POST https://vktbkehoymmgvrjujjka.supabase.co/functions/v1/send-assisted-access-welcome \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{
    "email": "your-test@example.com",
    "userId": "test-user-id"
  }'
```

#### What to Check:
- [ ] Email arrives from `no-reply@findyourdoctor.ca`
- [ ] Reply-To header is `support@findyourdoctor.ca`
- [ ] Logo displays correctly
- [ ] "Application Approved" card with checkmark
- [ ] "What's Included" section lists all features
- [ ] "Set Your Password" button works
- [ ] Password reset link is valid and not expired
- [ ] Footer links work

---

### 3. Password Reset Email

**Function**: `send-password-reset`  
**Sender**: `no-reply@findyourdoctor.ca`  
**Reply-To**: `support@findyourdoctor.ca`

#### Test via Frontend:
1. Go to `/auth`
2. Click "Forgot Password"
3. Enter test email address
4. Click submit

#### Test via Direct Function Call:
```bash
curl -X POST https://vktbkehoymmgvrjujjka.supabase.co/functions/v1/send-password-reset \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{
    "email": "your-test@example.com"
  }'
```

#### What to Check:
- [ ] Email arrives from `no-reply@findyourdoctor.ca`
- [ ] Reply-To header is `support@findyourdoctor.ca`
- [ ] Logo displays correctly
- [ ] "Reset Your Password" button works
- [ ] Reset link is valid
- [ ] "1 hour expiry" warning displays
- [ ] "Didn't request this?" section displays
- [ ] Footer links work

---

### 4. Paid Subscriber Welcome Email

**Function**: `send-paid-welcome`  
**Sender**: `no-reply@findyourdoctor.ca`  
**Reply-To**: `support@findyourdoctor.ca`

#### Test via Stripe (Full End-to-End):
1. Use Stripe test mode
2. Complete a test subscription purchase
3. Webhook should trigger and send welcome email

#### Test via Direct Function Call:
```bash
curl -X POST https://vktbkehoymmgvrjujjka.supabase.co/functions/v1/send-paid-welcome \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{
    "email": "your-test@example.com",
    "customerName": "John Doe",
    "subscriptionId": "sub_test123",
    "amount": "$7.99"
  }'
```

#### What to Check:
- [ ] Email arrives from `no-reply@findyourdoctor.ca`
- [ ] Reply-To header is `support@findyourdoctor.ca`
- [ ] Logo displays correctly
- [ ] "Welcome to Alert Service" celebration card
- [ ] Subscription details card shows amount and next billing date
- [ ] "What's Included" features list
- [ ] "Set Up Your Alerts" button works
- [ ] "Your subscription helps others" message displays
- [ ] Footer links work

---

### 5. Expiry Reminder Emails (3 variants)

**Function**: `send-expiry-reminders`  
**Sender**: `no-reply@findyourdoctor.ca`  
**Reply-To**: `support@findyourdoctor.ca`

#### Test via Scheduled Job:
These emails are sent automatically by the scheduled `send-expiry-reminders` function.

#### Test Manually:
1. Create a test profile with `status = 'assisted_access'`
2. Set `assisted_expires_at` to appropriate date:
   - For 30-day reminder: 29 days from now
   - For 7-day reminder: 6 days from now
   - For expiry: yesterday
3. Manually invoke `send-expiry-reminders` function

#### What to Check for 30-Day Reminder:
- [ ] Subject: "Your Assisted Access expires in 30 days"
- [ ] Clock emoji (⏰) in header card
- [ ] Expiry date shown clearly
- [ ] Renewal options explained
- [ ] "If your situation has improved" section
- [ ] "Renew Assisted Access" button works

#### What to Check for 7-Day Reminder:
- [ ] Subject: "⚠️ Your Assisted Access expires in 7 days"
- [ ] Warning emoji (⚠️) in header card
- [ ] Urgency communicated
- [ ] Options card lists renewal choices
- [ ] "Renew Now" button works

#### What to Check for Expiry Email:
- [ ] Subject: "Your Assisted Access has expired"
- [ ] Document emoji (📋) in header card
- [ ] Expiry date shown
- [ ] Options to reapply or subscribe
- [ ] "Always Free" search reminder
- [ ] Thank you message

---

## Reply-To Testing

For ALL emails:

1. **Reply to any test email**
2. **Verify the reply goes to**: `support@findyourdoctor.ca` (your Zoho inbox)
3. **Check that you can respond** from Zoho Mail

This confirms the reply-to routing is working correctly.

---

## Email Client Compatibility Testing

Test each email template in:

### Desktop Clients:
- [ ] Gmail (Chrome)
- [ ] Outlook (Windows)
- [ ] Apple Mail (macOS)
- [ ] Thunderbird

### Mobile Clients:
- [ ] Gmail app (iOS/Android)
- [ ] Outlook app (iOS/Android)
- [ ] Apple Mail (iOS)
- [ ] Samsung Email (Android)

### Web Clients:
- [ ] Gmail web
- [ ] Outlook.com
- [ ] Yahoo Mail

---

## Deliverability Testing

### Check Spam Score:
1. Send a test email to: `test-[random]@mail-tester.com`
2. Visit https://www.mail-tester.com and enter the test address
3. Aim for a score of 8/10 or higher

### Things to Monitor:
- [ ] SPF record is valid
- [ ] DKIM signature is present and valid
- [ ] From/Reply-To headers are correct
- [ ] No spam trigger words
- [ ] Links are not blacklisted
- [ ] Images load properly

---

## Logo Testing

The emails reference: `https://findyourdoctor.ca/logo-white.png`

### Verify:
- [ ] Logo file is accessible at this URL
- [ ] Logo displays in email clients
- [ ] Logo is white (for dark backgrounds)
- [ ] Logo has appropriate size (recommended: 200-300px wide)

### Alternative (if hosting logo is an issue):
Use Resend's attachment feature to embed logo as CID reference. Update the `getEmailHeader` function in `email-templates.ts` if needed.

---

## Edge Cases to Test

1. **Long doctor names** - Does the card layout break?
2. **Long addresses** - Does text wrap properly?
3. **Special characters in names** - Are they encoded correctly?
4. **Missing data** - What if phone number or address is missing?
5. **Very old emails** - Test with Gmail from 2010, Outlook 2007

---

## Success Criteria

All emails should:
- ✅ Deliver within 60 seconds
- ✅ Display branded header with logo
- ✅ Use correct sender address (alerts@ or no-reply@)
- ✅ Set reply-to as support@findyourdoctor.ca
- ✅ Render properly on all major email clients
- ✅ Have working links and buttons
- ✅ Display responsive design on mobile
- ✅ Pass spam score check (8/10+)
- ✅ Match FindYourDoctor brand colors

---

## Troubleshooting

### Email not arriving:
1. Check Supabase Edge Function logs
2. Verify Resend API key is configured
3. Check Resend dashboard for delivery status
4. Look in spam folder
5. Verify sender domain is verified in Resend

### Logo not displaying:
1. Verify logo URL is publicly accessible
2. Check CORS headers on logo file
3. Try different email client
4. Consider using base64 embedded image

### Reply-To not working:
1. Check email headers in raw source
2. Verify Zoho Mail is receiving emails to support@
3. Test with different email client

### Styling issues:
1. Check for inline CSS (email clients strip external CSS)
2. Use tables for layout (more compatible)
3. Test with Litmus or Email on Acid
4. Simplify complex layouts

---

## Post-Testing Checklist

- [ ] All 5 email types tested and working
- [ ] Reply-To routes to Zoho inbox
- [ ] Spam score is acceptable (8/10+)
- [ ] Mobile rendering is good
- [ ] Logo displays correctly
- [ ] All links work
- [ ] Tested in Gmail, Outlook, Apple Mail
- [ ] Production environment variables are set
- [ ] Monitoring/logging is in place
- [ ] Team knows how to respond to support emails in Zoho

---

## Next Steps

After testing is complete:

1. **Monitor** - Watch Resend dashboard for delivery rates
2. **Collect feedback** - Ask early users about email experience
3. **Iterate** - Adjust templates based on feedback
4. **Scale** - Monitor as email volume increases
5. **Maintain** - Update branding if company colors/logo change

---

**Note**: Remember to use test credit cards for Stripe testing and test email addresses that you control!
