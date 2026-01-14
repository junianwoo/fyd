# Deployment Checklist - Bug Fixes

## Pre-Deployment

### 1. Code Review
- [ ] Review all changes in git diff
- [ ] Verify TypeScript compilation passes
- [ ] Check for any console.log statements that should be removed
- [ ] Ensure all imports are correct

### 2. Local Testing
- [ ] Test assisted access signup flow locally
- [ ] Test upgrade flow with Stripe test cards
- [ ] Verify email sends (check Resend dashboard)
- [ ] Test password reset flow

### 3. Environment Variables
Verify these are set in Supabase:
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `RESEND_API_KEY`
- [ ] `SITE_URL`
- [ ] `STRIPE_PRICE_ID` (for Alert Service)

---

## Deployment Steps

### Step 1: Deploy Edge Function
```bash
cd /Users/albertwoo/Desktop/CURSOR\ PROJECTS/fyd
supabase functions deploy create-assisted-access-user
```

**Verify**:
- [ ] Function appears in Supabase dashboard
- [ ] Function has `verify_jwt = false` in config
- [ ] Test function with curl or Postman

### Step 2: Verify Database State
```sql
-- Check for any users stuck in bad state
SELECT 
  p.email, 
  p.status, 
  u.email_confirmed_at
FROM profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE p.status = 'alert_service' 
  AND p.stripe_subscription_id IS NULL;

-- Should return 0 results
```

If any results, manually investigate and fix.

### Step 3: Deploy Frontend
```bash
# Build frontend
npm run build

# If using Vercel
vercel --prod

# Or your deployment method
```

**Verify**:
- [ ] Frontend deploys successfully
- [ ] No TypeScript errors
- [ ] All routes accessible

### Step 4: Test in Production

#### Test 1: Assisted Access Signup
1. Use a NEW test email (e.g., `test-jan13@yourdomain.com`)
2. Complete signup form
3. **Verify**: Only ONE email received
4. **Verify**: Can set password and log in
5. **Verify**: Profile status is `assisted_access` in database

#### Test 2: Upgrade Flow
1. Log in with test assisted access account
2. Click "Upgrade to Paid Alert Service"
3. **Verify**: Either goes directly to checkout OR shows replacement dialog
4. Use test card: 4242 4242 4242 4242
5. Complete payment
6. **Verify**: Status updates to `alert_service` after webhook processes
7. **Verify**: Can add alert locations

---

## Post-Deployment Monitoring

### First Hour
Monitor these logs:
- [ ] Supabase edge function logs (check for errors)
- [ ] Stripe webhook delivery (should be 100% success rate)
- [ ] Resend email delivery logs
- [ ] Frontend error logs (Vercel/hosting dashboard)

### First 24 Hours
- [ ] Check for any 400 errors in create-checkout
- [ ] Verify no duplicate user accounts created
- [ ] Monitor for any reported user issues
- [ ] Check Stripe for any failed payment attempts

### First Week
- [ ] Review all assisted access signups
- [ ] Check conversion rate from assisted access to paid
- [ ] Verify email delivery rate remains high
- [ ] Monitor for any edge cases not covered in testing

---

## Rollback Instructions

### If Critical Issues Occur

**Quick Rollback (Frontend Only)**:
```bash
# Revert to previous deployment
vercel rollback

# Or redeploy previous git commit
git revert HEAD
npm run build
vercel --prod
```

**Quick Fix (Edge Function)**:
If the new edge function is causing issues:
```bash
# Option 1: Delete the function
supabase functions delete create-assisted-access-user

# Option 2: Deploy previous version
git checkout HEAD~1 supabase/functions/create-assisted-access-user/
supabase functions deploy create-assisted-access-user
```

**Revert Frontend Changes**:
In `AssistedAccess.tsx`, revert to:
```typescript
const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email,
  password: temporaryPassword,
  options: {
    emailRedirectTo: `${window.location.origin}/reset-password`,
    data: {
      applying_for_assisted_access: true,
      assisted_reason: reason,
      city: city,
    }
  },
});
```

---

## Database Cleanup (If Needed)

### Fix Users Without Email Confirmation
```sql
-- Find affected users
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email_confirmed_at IS NULL
  AND created_at > '2026-01-13'
ORDER BY created_at DESC;

-- Manually confirm emails if needed
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE id IN (
  -- List of user IDs from above query
);
```

### Fix Profiles with Wrong Status
```sql
-- Find profiles with alert_service but no Stripe data
SELECT user_id, email, status, stripe_subscription_id
FROM profiles
WHERE status = 'alert_service'
  AND stripe_subscription_id IS NULL;

-- Revert to correct status (case by case)
UPDATE profiles
SET status = 'assisted_access'
WHERE user_id = '[user-id]';
```

---

## Success Indicators

After deployment is successful, you should see:

### Metrics
- ✅ Assisted access signup completion rate: >90%
- ✅ Email delivery rate: >98%
- ✅ Upgrade checkout success rate: >95%
- ✅ Payment webhook processing: 100%
- ✅ Zero 400 errors on upgrade attempts
- ✅ Zero duplicate user accounts

### User Feedback
- ✅ No complaints about duplicate emails
- ✅ No complaints about upgrade errors
- ✅ No confusion about subscription status
- ✅ Positive feedback on clear messaging

### System Health
- ✅ All edge functions responding <3s
- ✅ Database queries executing efficiently
- ✅ Stripe webhooks processing <1s
- ✅ Email delivery <5s

---

## Troubleshooting Guide

### Issue: User didn't receive welcome email

**Check**:
1. Resend dashboard - was email sent?
2. Spam folder - check user's spam
3. Edge function logs - did function execute?
4. Email address typo - verify in database

**Fix**:
- Manually resend via Resend dashboard
- OR generate new password reset link:
```typescript
// In Supabase SQL editor
SELECT auth.admin.generate_recovery_link(email) 
FROM auth.users 
WHERE email = 'user@example.com';
```

---

### Issue: Upgrade returns 400 error

**Check**:
1. Stripe dashboard - is there an active subscription?
2. Edge function logs - what's the error message?
3. Profile status - what does database show?

**Debug**:
```sql
-- Check user's subscription state
SELECT 
  p.email,
  p.status,
  p.stripe_customer_id,
  p.stripe_subscription_id
FROM profiles p
WHERE p.email = 'user@example.com';
```

**Fix**:
- If subscription is canceled: Should work now (bug is fixed!)
- If subscription is truly active: This is correct behavior
- If no subscription but still errors: Check Stripe for orphaned customer

---

### Issue: Profile status not updating after payment

**Check**:
1. Stripe webhooks - was webhook delivered?
2. Webhook logs - any errors?
3. Stripe event ID - manually replay if needed

**Fix**:
```sql
-- Manually update status (after confirming payment in Stripe)
UPDATE profiles
SET 
  status = 'alert_service',
  stripe_subscription_id = '[subscription-id]',
  stripe_customer_id = '[customer-id]'
WHERE user_id = '[user-id]';
```

---

### Issue: User sees both assisted_access and alert_service

**This should be impossible now**, but if it happens:

**Fix**:
```sql
-- Determine which is correct by checking Stripe
-- If they have paid subscription:
UPDATE profiles 
SET status = 'alert_service'
WHERE user_id = '[user-id]';

-- If they don't have paid subscription:
UPDATE profiles 
SET 
  status = 'assisted_access',
  stripe_subscription_id = NULL
WHERE user_id = '[user-id]';
```

---

## Communication Plan

### Notify Team
- [ ] Dev team: Changes deployed
- [ ] Support team: New flow documentation
- [ ] Product team: Metrics to watch

### User Communication
If any users were affected by the bugs:
- [ ] Email affected users explaining the fix
- [ ] Offer support for any issues
- [ ] Consider compensation if appropriate

---

## Documentation Updates

After successful deployment:
- [ ] Update README.md with new edge function
- [ ] Update API documentation
- [ ] Add troubleshooting guide to support docs
- [ ] Document new environment variables

---

## Sign-Off

- [ ] QA tested all scenarios
- [ ] Product owner approved
- [ ] Tech lead reviewed code
- [ ] Ready for production deployment

**Deployed By**: ___________________
**Date**: ___________________
**Time**: ___________________
**Git Commit**: ___________________

---

## Emergency Contacts

If critical issues arise:
- Supabase Dashboard: https://supabase.com/dashboard
- Stripe Dashboard: https://dashboard.stripe.com
- Resend Dashboard: https://resend.com/dashboard
- Vercel Dashboard: https://vercel.com/dashboard

---

**Note**: Keep this checklist handy during deployment and for 24 hours after.
