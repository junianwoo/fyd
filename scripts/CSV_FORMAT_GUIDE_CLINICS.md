# Clinic CSV Import Format Guide

This guide explains the CSV format required for importing clinics into the FindYourDoctor platform.

## CSV File Requirements

### Required Columns

Your CSV **must** include these columns (in any order):

1. **name** - Clinic name (e.g., "Toronto Medical Centre")
2. **address** - Full street address
3. **city** - City name  
4. **province** - Province code (e.g., "ON")
5. **postal_code** - Postal code (e.g., "M5V 1J2")
6. **phone** - Phone number
7. **latitude** - Latitude coordinate (decimal format)
8. **longitude** - Longitude coordinate (decimal format)

### Optional Columns

These columns are optional but recommended:

- **languages** - Comma-separated list (e.g., "English,French,Mandarin")
- **google_place_id** - Google Places ID for reference
- **google_formatted_address** - Full formatted address from Google
- **source_url** - Source URL where data was obtained

## Example CSV

```csv
name,address,city,province,postal_code,phone,latitude,longitude,languages
Toronto Medical Centre,123 Main St,Toronto,ON,M5V 1J2,416-555-0100,43.6426,-79.3871,"English,French"
Oakville Family Clinic,456 Oak Ave,Oakville,ON,L6H 1A1,905-555-0200,43.4675,-79.6877,English
York Health Practice,789 York Rd,York,ON,M1R 2B3,416-555-0300,43.7731,-79.2581,"English,Mandarin,Cantonese"
```

## Field Details

### name
- **Required**: Yes
- **Format**: Text, any length
- **Example**: "Toronto Medical Centre"
- **Notes**: 
  - This is the primary identifier for the clinic
  - Should be the official clinic name
  - Used for duplicate detection in append mode

### address
- **Required**: Yes  
- **Format**: Street address
- **Example**: "123 Main St, Unit 4"
- **Notes**: Should include street number, street name, and unit/suite if applicable

### city
- **Required**: Yes
- **Format**: City name
- **Example**: "Toronto"
- **Notes**: If google_formatted_address is provided, city may be extracted from there

### province
- **Required**: Yes
- **Format**: 2-letter province code
- **Example**: "ON"
- **Notes**: Currently only Ontario is supported

### postal_code
- **Required**: Yes
- **Format**: Canadian postal code
- **Example**: "M5V 1J2" or "M5V1J2"
- **Notes**: Spaces are optional

### phone
- **Required**: Yes
- **Format**: Any phone number format
- **Examples**: "416-555-0100", "(416) 555-0100", "4165550100"
- **Notes**: Will be stored as provided

### latitude / longitude
- **Required**: Yes
- **Format**: Decimal degrees
- **Example**: 43.6426, -79.3871
- **Notes**: 
  - Required for map display and distance calculations
  - Can be obtained from Google Maps Geocoding API
  - Must be valid coordinates in Ontario

### languages
- **Required**: No
- **Format**: Comma-separated list
- **Example**: "English,French,Mandarin"
- **Notes**:
  - If not provided, defaults to "English"
  - First letter will be capitalized automatically
  - Separate multiple languages with commas

## Import Modes

### Replace Mode (Default)
- **Action**: Deletes ALL existing clinics, then imports CSV data
- **Use when**: You want to completely replace the clinic database
- **Warning**: This is destructive and cannot be undone!

### Append Mode
- **Action**: Adds new clinics, skips duplicates
- **Duplicate detection**: By clinic name (case-insensitive)
- **Use when**: Adding new clinics to existing database
- **Note**: Existing clinics with the same name will be skipped

## Default Values

When importing, these defaults are applied:

- **accepting_status**: "unknown"
- **status_verified_by**: "community"
- **accessibility_features**: [] (empty)
- **age_groups_served**: ["Adults"]
- **virtual_appointments**: false
- **claimed_by_clinic**: false
- **community_report_count**: 0

## Common Issues

### Issue: "Column count mismatch"
**Solution**: Ensure all rows have the same number of columns as the header row

### Issue: "Invalid latitude/longitude"
**Solution**: Coordinates must be valid decimal numbers (not text)

### Issue: "Duplicate clinic"
**Solution**: In append mode, clinic names must be unique

### Issue: "Missing required field"
**Solution**: Ensure all required columns are present in CSV

## Tips

1. **Use quotes** for fields containing commas:
   ```csv
   "Toronto Medical Centre, Downtown Location",123 Main St,...
   ```

2. **Geocode addresses** before import using Google Maps Geocoding API

3. **Verify coordinates** by checking a few on Google Maps

4. **Test with small CSV** first (5-10 clinics) before importing large datasets

5. **Backup before replace mode** - You cannot undo a full replacement

6. **Use append mode** when updating specific clinics - just include the new ones

## Getting Geocoding Data

To get latitude, longitude, and google_formatted_address:

1. Use Google Maps Geocoding API
2. Send address to API: `https://maps.googleapis.com/maps/api/geocode/json?address=YOUR_ADDRESS&key=YOUR_API_KEY`
3. Extract from response:
   - `geometry.location.lat` → latitude
   - `geometry.location.lng` → longitude  
   - `formatted_address` → google_formatted_address
   - `place_id` → google_place_id

## Questions?

If you encounter issues with the import:
1. Check the browser console for detailed error messages
2. Verify your CSV matches the example format exactly
3. Ensure all required fields are present and valid
4. Contact support if problems persist
