import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CSVClinic {
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  phone: string;
  latitude: string;
  longitude: string;
  languages?: string;
  google_place_id?: string;
  google_formatted_address?: string;
  source_url?: string;
}

// Parse CSV content into array of objects
function parseCSV(content: string): CSVClinic[] {
  const lines = content.trim().split("\n");
  const headers = parseCSVLine(lines[0]);
  
  const clinics: CSVClinic[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) {
      console.warn(`Skipping line ${i + 1}: column count mismatch`);
      continue;
    }
    
    const clinic: Record<string, string> = {};
    headers.forEach((header, index) => {
      clinic[header] = values[index] || "";
    });
    
    clinics.push(clinic as unknown as CSVClinic);
  }
  
  return clinics;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Extract city from Google formatted address or fallback
function extractCity(googleAddress: string, fallbackCity: string): string {
  if (!googleAddress) return fallbackCity;
  
  const parts = googleAddress.split(",");
  if (parts.length >= 3) {
    return parts[parts.length - 3].trim();
  }
  
  return fallbackCity;
}

// Parse languages string into array
function parseLanguages(languagesStr: string): string[] {
  if (!languagesStr) return ["English"];
  
  return languagesStr
    .split(",")
    .map((lang) => lang.trim())
    .filter((lang) => lang.length > 0)
    .map((lang) => {
      // Capitalize first letter
      return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
    });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { csvContent, clearExisting = true } = await req.json();

    if (!csvContent) {
      return new Response(
        JSON.stringify({ error: "No CSV content provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Parsing CSV content...");
    const csvClinics = parseCSV(csvContent);
    console.log(`Parsed ${csvClinics.length} clinics from CSV`);

    // Clear existing clinics if requested (replace mode)
    if (clearExisting) {
      console.log("Clearing existing clinics (replace mode)...");
      const { error: deleteError } = await supabase
        .from("clinics")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (deleteError) {
        console.error("Error clearing clinics:", deleteError);
        return new Response(
          JSON.stringify({ error: `Failed to clear existing clinics: ${deleteError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log("Existing clinics cleared");
    }

    // Get existing clinic names to avoid duplicates (append mode)
    let existingClinicNames = new Set<string>();
    if (!clearExisting) {
      console.log("Getting existing clinic names for duplicate check...");
      const { data: existingClinics, error: fetchError } = await supabase
        .from("clinics")
        .select("name");

      if (fetchError) {
        console.error("Error fetching existing clinics:", fetchError);
      } else if (existingClinics) {
        existingClinicNames = new Set(existingClinics.map((c: any) => c.name.toLowerCase()));
        console.log(`Found ${existingClinicNames.size} existing clinics`);
      }
    }

    // Insert in batches
    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];
    const batchSize = 100;

    for (let i = 0; i < csvClinics.length; i += batchSize) {
      const batch = csvClinics.slice(i, i + batchSize);
      
      // Filter out duplicates in append mode (by clinic name)
      const filteredBatch = clearExisting 
        ? batch 
        : batch.filter(clinic => {
            if (existingClinicNames.has(clinic.name.toLowerCase())) {
              skipped++;
              return false;
            }
            return true;
          });
      
      if (filteredBatch.length === 0) {
        continue;
      }
      
      const transformedBatch = filteredBatch.map((clinic) => ({
        name: clinic.name.trim(),
        address: clinic.address,
        city: extractCity(clinic.google_formatted_address || "", clinic.city),
        province: clinic.province || "ON",
        postal_code: clinic.postal_code,
        phone: clinic.phone,
        latitude: parseFloat(clinic.latitude),
        longitude: parseFloat(clinic.longitude),
        accepting_status: "unknown" as const,
        status_verified_by: "community" as const,
        languages: parseLanguages(clinic.languages || ""),
        accessibility_features: [],
        age_groups_served: ["Adults"],
        virtual_appointments: false,
        claimed_by_clinic: false,
        community_report_count: 0,
      }));

      const { data, error } = await supabase
        .from("clinics")
        .insert(transformedBatch)
        .select("id");

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
      } else {
        inserted += data?.length || 0;
        console.log(`Inserted batch ${i / batchSize + 1}: ${data?.length || 0} clinics (total: ${inserted})`);
      }
    }

    const result = {
      success: errors.length === 0,
      inserted,
      skipped,
      total: csvClinics.length,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log("Import complete:", result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Import error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
