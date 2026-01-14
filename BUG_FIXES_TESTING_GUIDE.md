# Bug Fixes Testing Guide

## Summary of Changes

### Bug 1: Duplicate Emails on Assisted Access Signup
**Fixed**: Users now receive only ONE email (the branded welcome email) when signing up for assisted access.

**Changes Made:**
- Created new edge function `create-assisted-access-user` that uses `admin.createUser()` with `email_confirm: true`
- Updated `AssistedAccess.tsx` to call the new edge function instead of `supabase.auth.signUp()`
- This bypasses Supabase's default "Confirm Your Signup" email entirely

### Bug 2: 400 Error on Upgrade Attempt
**Fixed**: Assisted access users can now successfully upgrade even if they have a canceled Stripe subscription.

**Changes Made:**
- Modified `create-checkout` function to check `cancel_at_period_end` property
- If subscription is canceled (but still active until period end), it's now canceled immediately
- Users are informed via a confirmation dialog before proceeding

### Bug 3: False Alert Service Status After Failed Upgrade
**Fixed**: Profile status is no longer prematurely updated to `alert_service` before payment completes.

**Changes Made:**
- Removed lines 110-126 from `create-checkout` that were updating profile status on error
- Profile status now ONLY updates via the stripe-webhook after successful payment
- Added proper logging to track subscription state changes

### Bug 4: User Messaging for Subscription Replacement
**Added**: Users see a clear confirmation dialog when their canceled subscription will be replaced.

**Changes Made:**
- Added confirmation dialog in `Dashboard.tsx` with AlertDialog component
- Shows subscription end date and explains what will happen
- Gives users choice to proceed or cancel

### Bug 5: Email Verification Logging
**Enhanced**: Added logging to verify email confirmation during password reset flow.

**Changes Made:**
- Added console logging in `ResetPassword.tsx` to confirm email verification
- Logs user ID and email confirmation status after password update

## Testing Instructions

### Prerequisites
- Clean test environment with Stripe test mode enabled
- Access to Supabase dashboard to verify database records
- Email testing capability (check inbox/logs)
- Test reCAPTCHA site key configured

---

## Test Suite

### Test 1: Assisted Access Signup (Bug 1)

**Steps:**
1. Navigate to `/assisted-access`
2. Fill out the application form:
   - Email: test-assisted@example.com
   - City: Toronto
   - Reason: "Testing the signup flow" (20+ chars)
   - Check confirmation checkbox
   - Complete reCAPTCHA
3. Submit the application

**Expected Results:**
- ✅ User is redirected to confirmation page
- ✅ ONE email is received: "Welcome to FindYourDoctor - Your Assisted Access is Approved!"
- ✅ NO "Confirm Your Signup" email from Supabase is received
- ✅ Database check: User has `email_confirm: true` in auth.users table
- ✅ Database check: Profile has `status: 'assisted_access'` and `assisted_expires_at` set to 6 months from now

**Verification:**
```sql
-- Check auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'test-assisted@example.com';

-- Check profiles
SELECT user_id, email, status, assisted_expires_at, assisted_reason
FROM profiles 
WHERE email = 'test-assisted@example.com';
```

---

### Test 2: Password Setup from Welcome Email

**Steps:**
1. Open the welcome email received in Test 1
2. Click "Set Your Password" button
3. Set a password (8+ characters)
4. Confirm the password
5. Click "Set Password & Continue"

**Expected Results:**
- ✅ Password is set successfully
- ✅ Console logs show email is confirmed
- ✅ User is redirected to `/dashboard`
- ✅ User is automatically logged in
- ✅ Dashboard shows "Assisted Access" status

**Console Logs to Verify:**
```
[PASSWORD-RESET] Password updated for user: [user-id]
[PASSWORD-RESET] Email confirmed: YES
```

---

### Test 3: Upgrade Attempt - Clean User (No Stripe History)

**Steps:**
1. Log in as assisted access user from Test 1 & 2
2. Go to Dashboard
3. Find "Upgrade to Paid Alert Service" button
4. Click the button

**Expected Results:**
- ✅ No error occurs
- ✅ Redirected to Stripe Checkout page
- ✅ Checkout session shows $7.99/month subscription
- ✅ Profile status remains `assisted_access` (NOT changed yet)

**Edge Function Logs to Check:**
```
[CREATE-CHECKOUT] Email validated
[CREATE-CHECKOUT] No existing customer, will create new
[CREATE-CHECKOUT] Checkout session created
```

---

### Test 4: Upgrade Attempt - User with Canceled Subscription (Bug 2 & 3)

**Setup:**
1. Create a test subscription for the user in Stripe dashboard
2. Cancel the subscription (but don't delete it)
3. Verify subscription shows `status: 'active'` and `cancel_at_period_end: true`

**Steps:**
1. Log in as assisted access user
2. Go to Dashboard
3. Click "Upgrade to Paid Alert Service"

**Expected Results:**
- ✅ NO 400 error occurs
- ✅ Confirmation dialog appears with message:
  > "You have a canceled subscription that is still active until [date]"
  > "If you continue: Your current subscription will end immediately..."
- ✅ Click "Continue to Checkout"
- ✅ Old subscription is canceled in Stripe (check Stripe dashboard)
- ✅ Redirected to Stripe Checkout page
- ✅ Profile status remains `assisted_access` (NOT changed to `alert_service` prematurely)

**Edge Function Logs to Check:**
```
[CREATE-CHECKOUT] Found active subscription
[CREATE-CHECKOUT] Subscription is canceled but active, will cancel immediately
[CREATE-CHECKOUT] Old subscription canceled immediately
[CREATE-CHECKOUT] Checkout session created
```

**Stripe Verification:**
- Old subscription status changes from `active` to `canceled`
- Old subscription `ended_at` is set to current time (not future)

---

### Test 5: Complete Payment Flow

**Steps:**
1. Continue from Test 4 checkout session
2. Use Stripe test card: `4242 4242 4242 4242`
3. Enter any future expiry date and CVC
4. Complete the payment

**Expected Results:**
- ✅ Redirected to dashboard with `?success=true`
- ✅ Toast notification: "Subscription activated!"
- ✅ Profile status updates to `alert_service` (NOW it should update)
- ✅ Dashboard shows "Alert Service" subscription status
- ✅ User can add alert locations (up to 3)

**Webhook Verification:**
Check Stripe webhook logs for:
- `checkout.session.completed` event received
- Profile updated to `alert_service` via webhook

```sql
-- Verify final state
SELECT user_id, email, status, stripe_customer_id, stripe_subscription_id
FROM profiles 
WHERE email = 'test-assisted@example.com';
```

---

### Test 6: User with Truly Active Subscription (Should Block)

**Setup:**
1. User already has an active, non-canceled subscription
2. Subscription has `cancel_at_period_end: false`

**Steps:**
1. Log in as user with active subscription
2. Try to create another checkout session

**Expected Results:**
- ✅ Returns 400 error
- ✅ Error message: "You already have an active Alert Service subscription."
- ✅ Redirected to dashboard
- ✅ Profile status NOT changed

---

## Database Verification Queries

### Check User Status
```sql
SELECT 
  p.user_id,
  p.email,
  p.status,
  p.assisted_expires_at,
  p.stripe_customer_id,
  p.stripe_subscription_id,
  u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE p.email = 'test-assisted@example.com';
```

### Check for Duplicate Emails
```sql
-- Should return 0 results (no duplicate signups)
SELECT email, COUNT(*) 
FROM profiles 
GROUP BY email 
HAVING COUNT(*) > 1;
```

---

## Edge Cases to Test

### Edge Case 1: User Tries to Sign Up Twice
**Steps:**
1. Complete assisted access signup
2. Try to sign up again with same email

**Expected Result:**
- Error: "This email is already registered. Please log in to your account."

### Edge Case 2: Password Reset Link Expires
**Steps:**
1. Request password reset
2. Wait for link to expire (or use old link)
3. Try to set password

**Expected Result:**
- Error: "Invalid or expired link"
- Redirected to auth page

### Edge Case 3: reCAPTCHA Fails
**Steps:**
1. Start signup
2. Don't complete reCAPTCHA (or use invalid token)
3. Submit form

**Expected Result:**
- Error: "Please complete the reCAPTCHA"

---

## Deployment Checklist

Before deploying to production:

- [ ] Deploy new edge function: `supabase functions deploy create-assisted-access-user`
- [ ] Verify edge function has correct permissions in Supabase dashboard
- [ ] Test in staging environment first
- [ ] Monitor Stripe webhook delivery
- [ ] Check email delivery (Resend dashboard)
- [ ] Verify reCAPTCHA works in production
- [ ] Test with real Stripe test cards
- [ ] Monitor error logs for first 24 hours

---

## Rollback Plan

If issues occur after deployment:

1. **Quick Rollback**: Revert `AssistedAccess.tsx` to use `supabase.auth.signUp()` again
2. **Database Cleanup**: If needed, manually verify email for affected users:
   ```sql
   UPDATE auth.users 
   SET email_confirmed_at = now() 
   WHERE email IN ('affected-email@example.com');
   ```
3. **Stripe Cleanup**: Manually cancel any duplicate subscriptions in Stripe dashboard

---

## Success Criteria

All bugs are considered fixed when:

- ✅ Assisted access signup sends exactly 1 email
- ✅ Users can upgrade from assisted access without 400 errors
- ✅ Profile status only updates after successful payment
- ✅ Users see clear messaging about subscription replacement
- ✅ Password reset flow properly verifies emails
- ✅ No duplicate user records created
- ✅ All database constraints satisfied
- ✅ Stripe webhooks working correctly
