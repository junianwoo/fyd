# CSV Import Format Guide

## Problem: CSV Upload Failing in Supabase

If you're getting errors about fields not existing when uploading your CSV directly to Supabase, it's because your CSV has extra columns (like Google Maps geocoded fields) that aren't in the database.

## Solution 1: Use the Import Tool (Recommended) ✅

Use the `import-doctors.html` tool which handles all field transformations automatically!

**Steps:**
1. Open `scripts/import-doctors.html` in your browser
2. Enter your Supabase URL and Service Role Key
3. Select your CSV file (can include all Google Maps fields!)
4. Click "Import Doctors"

The tool will automatically:
- Transform Google Maps fields
- Format names correctly
- Extract clinic names from addresses
- Handle language arrays
- Skip duplicates based on CPSO number

## Solution 2: Clean Your CSV Manually

If you prefer to upload directly via Supabase UI, remove these columns from your CSV:
- ❌ `google_place_id`
- ❌ `google_formatted_address`
- ❌ `source_url`
- ❌ `member_status` (not stored in database)

### Minimum Required Columns:

```csv
full_name,address,city,province,postal_code,phone,latitude,longitude
```

### Recommended Columns (with defaults):

```csv
cpso_number,full_name,clinic_name,address,city,province,postal_code,phone,email,website,latitude,longitude,languages
```

### Example CSV:

```csv
cpso_number,full_name,clinic_name,address,city,province,postal_code,phone,email,website,latitude,longitude,languages
12345,Dr. John Smith,Main Street Clinic,123 Main St,Toronto,ON,M5V1A1,416-555-1234,john@clinic.com,https://clinic.com,43.6532,-79.3832,"English, French"
67890,Dr. Jane Doe,Downtown Health,456 Bay St,Toronto,ON,M5H2Y4,416-555-5678,jane@health.com,https://health.com,43.6426,-79.3871,English
```

### Notes on Data Types:

- **languages**: Can be comma-separated string, will be converted to array
- **latitude/longitude**: Decimal numbers (e.g., 43.6532, -79.3832)
- **cpso_number**: Optional but recommended for avoiding duplicates
- **phone**: Text field, any format
- **province**: Defaults to 'ON' if not provided

## Solution 3: Add Columns to Database (Advanced)

If you want to keep the Google Maps data in your database:

```sql
-- Add Google Maps fields to doctors table
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS google_place_id TEXT,
ADD COLUMN IF NOT EXISTS google_formatted_address TEXT,
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_google_place_id ON public.doctors(google_place_id);
```

Then your CSV can include these fields and they'll be stored.

## CSV Format Your Import Function Expects

The `import-doctors` Edge Function expects this format:

```
cpso_number,full_name,member_status,languages,address,city,province,postal_code,phone,latitude,longitude,google_place_id,google_formatted_address,source_url
```

But it only inserts these fields to the database:
- cpso_number
- full_name (formatted)
- clinic_name (extracted from address)
- address
- city (from google_formatted_address or city field)
- province
- postal_code
- phone
- latitude (converted to decimal)
- longitude (converted to decimal)
- languages (parsed into array)
- accepting_status (defaults to 'unknown')
- status_verified_by (defaults to 'community')
- accessibility_features (empty array)
- age_groups_served (defaults to ['Adults'])
- virtual_appointments (defaults to false)
- claimed_by_doctor (defaults to false)
- community_report_count (defaults to 0)

## Troubleshooting

### "Column 'google_place_id' does not exist"
→ Use the import tool or remove Google Maps columns from CSV

### "Invalid input syntax for type numeric"
→ Check latitude/longitude are valid decimal numbers

### "Null value in column violates not-null constraint"
→ Ensure required fields (full_name, address, city, postal_code, phone, latitude, longitude) are not empty

### "Duplicate key value violates unique constraint"
→ You have duplicate CPSO numbers. The import tool skips these automatically, or remove duplicates from your CSV

## Need Help?

1. Try the `import-doctors.html` tool first - it handles most issues automatically
2. Check your CSV has all required columns
3. Verify latitude/longitude are valid numbers
4. Ensure no empty required fields

## Quick Comparison

| Method | Pros | Cons |
|--------|------|------|
| **Import Tool** | ✅ Handles transformations<br>✅ Validates data<br>✅ Skip duplicates<br>✅ Batch processing | Requires Edge Function deployed |
| **Direct Upload** | ✅ Simple<br>✅ Built into Supabase UI | ❌ Must match schema exactly<br>❌ No transformations<br>❌ No duplicate handling |
| **Add Columns** | ✅ Keep all data<br>✅ Direct upload works | ❌ Database schema changes<br>❌ More storage |

**Recommendation**: Use the import tool - it's designed for exactly this use case!
