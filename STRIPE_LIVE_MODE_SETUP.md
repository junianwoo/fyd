# Stripe Live Mode Setup Guide

## 🚨 CRITICAL: Switch to Live Stripe Payments

This guide walks you through switching from Stripe test mode to live production mode.

---

## Prerequisites

Before starting:
- [ ] Stripe account fully activated (not in test mode)
- [ ] Business verification completed in Stripe (if required)
- [ ] Bank account connected for payouts
- [ ] Access to Supabase project settings

---

## Step 1: Get Live Stripe API Keys

### 1.1 Log into Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. **Make sure you're in LIVE mode** (toggle in top left should say "Viewing test data" - click to switch to live)
3. You should see a banner saying you're viewing live data

### 1.2 Get Secret Key
1. Navigate to **Developers** → **API keys**
2. In the **Standard keys** section:
   - Copy the **Secret key** (starts with `sk_live_`)
   - ⚠️ **Never share this key or commit it to git**

### 1.3 Get Webhook Signing Secret
1. Navigate to **Developers** → **Webhooks**
2. Click **Add endpoint** (or edit existing endpoint)
3. Set endpoint URL to: `https://[YOUR-PROJECT-REF].supabase.co/functions/v1/stripe-webhook`
   - Get your project ref from Supabase dashboard URL
   - Example: `https://abcdefghijk.supabase.co/functions/v1/stripe-webhook`
4. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

---

## Step 2: Create Live Product and Price

### 2.1 Create Product
1. In Stripe dashboard, go to **Products** → **Add product**
2. Fill in details:
   - **Name**: FindYourDoctor.ca Alert Service
   - **Description**: Monthly email alerts when clinics begin accepting patients
   - **Pricing**: Recurring
   - **Price**: $7.99 CAD
   - **Billing period**: Monthly
3. Click **Add product**

### 2.2 Get Price ID
1. Click on the product you just created
2. In the **Pricing** section, find the price you created
3. Copy the **Price ID** (starts with `price_`)
   - Example: `price_1AbCdEfGhIjKlMnO`

---

## Step 3: Update Supabase Environment Variables

### 3.1 Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project
3. Go to **Project Settings** → **Edge Functions**

### 3.2 Update Secret Variables
Click **Add new secret** or edit existing:

1. **STRIPE_SECRET_KEY**
   - Delete the test key (`sk_test_...`)
   - Add your live key (`sk_live_...`)

2. **STRIPE_WEBHOOK_SECRET**
   - Delete the test webhook secret
   - Add your live webhook secret (`whsec_...`)

3. **STRIPE_PRICE_ID**
   - Delete the test price ID
   - Add your live price ID (`price_...`)

### 3.3 Verify All Keys Are Set
Required environment variables:
- ✅ `STRIPE_SECRET_KEY` (starts with `sk_live_`)
- ✅ `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)
- ✅ `STRIPE_PRICE_ID` (starts with `price_`)
- ✅ `RESEND_API_KEY` (for emails)
- ✅ `SITE_URL` (your production URL)
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 4: Redeploy Edge Functions

The edge functions need to be redeployed to pick up the new environment variables.

### 4.1 Deploy Functions
```bash
cd /Users/albertwoo/Desktop/CURSOR\ PROJECTS/fyd

# Deploy all Stripe-related functions
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy customer-portal
supabase functions deploy check-subscription
```

### 4.2 Verify Deployment
- [ ] Check Supabase dashboard → **Edge Functions**
- [ ] All 4 functions should show recent deployment time
- [ ] No error indicators

---

## Step 5: Test Live Payments

### ⚠️ IMPORTANT: Use REAL payment method for testing live mode

### 5.1 Test Checkout Flow
1. Open your site in incognito/private browser
2. Create a new account or log in
3. Click "Subscribe - $7.99/mo"
4. **Use a REAL credit card** (you'll be charged $7.99)
5. Complete payment
6. Verify:
   - [ ] Redirected back to dashboard
   - [ ] Status shows "Alert Service" 
   - [ ] Can add alert locations

### 5.2 Verify in Stripe Dashboard
1. Go to **Payments** in Stripe
2. You should see your test payment
3. Check **Customers** - your customer should appear
4. Check **Subscriptions** - should show active subscription

### 5.3 Verify Webhook Delivery
1. In Stripe, go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Check recent deliveries - should show 200 success status
4. If any failures, check the error details

### 5.4 Test in Your Dashboard
1. Log in as the test customer
2. Verify:
   - [ ] Status badge shows "Alert Service"
   - [ ] Can add up to 3 locations
   - [ ] "Manage Billing" button works
   - [ ] Clicking "Manage Billing" opens Stripe portal

### 5.5 Test Stripe Customer Portal
1. Click "Manage Billing" in your dashboard
2. Stripe Customer Portal should open
3. Test canceling subscription:
   - [ ] Cancel subscription
   - [ ] Should work at end of billing period
   - [ ] Status updates correctly in your app

---

## Step 6: Cancel Test Subscription

After verifying everything works:
1. Go to Stripe Customer Portal (from your dashboard)
2. Cancel the test subscription
3. Get a refund in Stripe dashboard if desired:
   - Go to **Payments**
   - Click on the payment
   - Click **Refund**

---

## Step 7: Monitor Production

### First 24 Hours
- [ ] Monitor Stripe webhook deliveries (should be 100% success)
- [ ] Check for any failed payments
- [ ] Verify all subscriptions appear correctly
- [ ] Monitor Supabase edge function logs for errors

### Ongoing
- [ ] Check Stripe dashboard daily for first week
- [ ] Set up email alerts in Stripe for failed payments
- [ ] Monitor customer support for payment issues

---

## Troubleshooting

### Webhook Returns 401 Unauthorized
**Issue**: Edge function can't authenticate requests  
**Fix**: Verify `STRIPE_WEBHOOK_SECRET` is set correctly in Supabase

### Checkout Session Fails
**Issue**: Invalid price ID or secret key  
**Fix**: 
1. Verify `STRIPE_SECRET_KEY` starts with `sk_live_`
2. Verify `STRIPE_PRICE_ID` starts with `price_` and is from live mode
3. Redeploy edge functions

### Payment Succeeds but Status Doesn't Update
**Issue**: Webhook not being processed  
**Fix**:
1. Check Stripe webhook deliveries
2. Check Supabase edge function logs for `stripe-webhook`
3. Verify webhook secret matches

### Customer Portal Link Doesn't Work
**Issue**: Customer ID mismatch or wrong mode  
**Fix**: Verify you're using live Stripe keys, not test keys

---

## Rollback to Test Mode

If you need to go back to test mode:

1. In Stripe dashboard, copy test keys:
   - Test Secret Key (`sk_test_...`)
   - Test Webhook Secret (`whsec_test_...`)
   - Test Price ID (`price_test_...`)

2. Update Supabase environment variables with test keys

3. Redeploy edge functions:
   ```bash
   supabase functions deploy create-checkout
   supabase functions deploy stripe-webhook
   supabase functions deploy customer-portal
   supabase functions deploy check-subscription
   ```

---

## Security Checklist

Before going live, verify:
- [ ] Live Stripe keys are stored ONLY in Supabase (never in git)
- [ ] Webhook endpoint uses HTTPS
- [ ] Webhook signature validation is enabled
- [ ] Service role key is kept secret
- [ ] All environment variables are set correctly

---

## Success Indicators

✅ You're successfully in live mode when:
- Stripe dashboard shows "Viewing live data"
- Test payments use real credit cards
- Customers appear in live Stripe dashboard
- Webhooks deliver successfully to production
- Customer portal works correctly
- Subscriptions create and cancel properly

---

## Support

If you encounter issues:
1. Check Supabase edge function logs
2. Check Stripe webhook delivery logs
3. Review this checklist step by step
4. Contact Stripe support if payment processing issues persist

---

**You're ready to accept real payments! 🚀**
