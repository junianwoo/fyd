# Community Report Duplicate Prevention Fix

## Issue
**Critical Bug:** Users could submit multiple reports for the same doctor, allowing a single person to trigger status updates and false alerts.

## Root Cause
The IP-based rate limiting logic existed in the edge function but was never executed because:
1. Frontend sent `reporterIp: null` 
2. IP address was never captured server-side
3. User ID was not tracked at all

## Solution Implemented

### 1. Database Changes (Migration: 20260110000003)
```sql
-- Add user_ids array to pending_updates table
ALTER TABLE public.pending_updates
ADD COLUMN user_ids text[] NOT NULL DEFAULT ARRAY[]::text[];

-- Add user_id to community_reports for audit trail
ALTER TABLE public.community_reports
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for faster lookups
CREATE INDEX idx_pending_updates_doctor_status ON public.pending_updates(doctor_id, status);
CREATE INDEX idx_community_reports_doctor_user ON public.community_reports(doctor_id, user_id);
```

### 2. Edge Function Changes (process-community-update)
**Improved duplicate detection:**
- ✅ Captures IP address from request headers (`x-forwarded-for`, `x-real-ip`)
- ✅ Extracts authenticated user ID from auth token
- ✅ Blocks duplicate reports from same IP address
- ✅ Blocks duplicate reports from same user ID
- ✅ Stores both IP and user ID arrays in `pending_updates`
- ✅ User-friendly error message: "You've already submitted an update for this doctor today"

**Security Features:**
- Server-side IP capture (can't be spoofed by client)
- User authentication tracking for logged-in users
- Anonymous users tracked by IP only
- Audit trail in `community_reports` table

## How It Works Now

1. **User submits update** → System captures IP & user ID
2. **Check for duplicates:**
   - Same IP already reported? → Block with friendly message
   - Same user ID already reported? → Block with friendly message
3. **If unique:** Add to pending_updates counter
4. **When threshold reached (2 reports):** Update doctor status & trigger alerts
5. **Reset:** All pending updates cleared after status change

## Testing

### Test Duplicate Prevention:
1. **Same User, Same Doctor:**
   - Submit an update for a doctor
   - Try to submit again immediately
   - Expected: ❌ "You've already submitted an update for this doctor today"

2. **Different Users, Same Doctor:**
   - User A submits update
   - User B submits same update
   - Expected: ✅ Doctor status changes, alerts sent

3. **Anonymous vs Logged In:**
   - Test with logged-out user (IP tracking)
   - Test with logged-in user (user ID tracking)

### Verify Database:
```sql
-- Check pending_updates for a doctor
SELECT * FROM pending_updates WHERE doctor_id = 'DOCTOR_ID_HERE';

-- Check community_reports for tracking
SELECT doctor_id, reported_status, user_id, reporter_ip, created_at 
FROM community_reports 
WHERE doctor_id = 'DOCTOR_ID_HERE'
ORDER BY created_at DESC;
```

## Deployment Steps

### 1. Apply Database Migration
Go to: https://supabase.com/dashboard/project/mhgpqdupntonqzhkkhht/sql/new

Paste and run the SQL from migration file: `20260110000003_add_user_tracking_to_pending_updates.sql`

### 2. Deploy Edge Function
```bash
npx supabase functions deploy process-community-update --project-ref mhgpqdupntonqzhkkhht
```

✅ **Already deployed!**

## Next Steps for Testing

1. Clear any existing pending_updates:
```sql
DELETE FROM pending_updates;
```

2. Test duplicate prevention:
   - Go to any doctor detail page
   - Submit an update (status: "Accepting")
   - Try to submit again → Should be blocked
   - Open incognito/different browser
   - Submit as different user → Should succeed
   - Doctor status should now update

## Security Notes

- IP addresses are hashed/anonymized in production (future enhancement)
- User IDs are already protected by RLS policies
- Audit trail preserved in `community_reports` table
- 24-hour cooldown per user per doctor per status (can be adjusted)

---

**Date Fixed:** January 10, 2026  
**Tested:** ⏳ Pending user testing  
**Priority:** 🔴 Critical - Prevents false alerts
