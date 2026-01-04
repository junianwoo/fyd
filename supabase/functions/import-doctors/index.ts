import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CSVDoctor {
  cpso_number: string;
  full_name: string;
  member_status: string;
  languages: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  phone: string;
  latitude: string;
  longitude: string;
  google_place_id: string;
  google_formatted_address: string;
  source_url: string;
}

// Parse CSV content into array of objects
function parseCSV(content: string): CSVDoctor[] {
  const lines = content.trim().split("\n");
  const headers = parseCSVLine(lines[0]);
  
  const doctors: CSVDoctor[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) {
      console.warn(`Skipping line ${i + 1}: column count mismatch`);
      continue;
    }
    
    const doctor: Record<string, string> = {};
    headers.forEach((header, index) => {
      doctor[header] = values[index] || "";
    });
    
    doctors.push(doctor as unknown as CSVDoctor);
  }
  
  return doctors;
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

// Convert "Last, First Middle" to "First Middle Last"
function formatName(name: string): string {
  if (!name.includes(",")) return name.trim();
  
  const [lastName, firstMiddle] = name.split(",").map((s) => s.trim());
  if (!firstMiddle) return lastName;
  
  return `${firstMiddle} ${lastName}`;
}

// Extract clinic name from address if present
function extractClinicName(address: string, fullName: string): string {
  // Common clinic identifiers
  const clinicPatterns = [
    /^(.+?(?:Medical|Health|Family|Clinic|Centre|Center|Practice|Healthcare|Wellness|Associates|Group|Office)(?:\s+\w+)?)\s+(?:\d|Unit|Suite|Floor)/i,
    /^([A-Za-z\s&'-]+(?:Medical|Health|Family|Clinic|Centre|Center|Practice|Healthcare|Wellness|Associates|Group))\s/i,
  ];
  
  for (const pattern of clinicPatterns) {
    const match = address.match(pattern);
    if (match && match[1]) {
      const clinicName = match[1].trim();
      // Ensure it's not just a street name
      if (clinicName.length > 5 && !/^\d/.test(clinicName)) {
        return clinicName;
      }
    }
  }
  
  // Use doctor's name as practice name
  return `Dr. ${formatName(fullName)}'s Practice`;
}

// Extract city from Google formatted address
function extractCity(googleAddress: string, originalCity: string): string {
  if (originalCity && originalCity !== "Nan" && originalCity.trim()) {
    return originalCity.trim();
  }
  
  if (!googleAddress) return "Toronto";
  
  // Google formatted address is like: "123 Street, City, ON M1M 1M1, Canada"
  const parts = googleAddress.split(",").map((s) => s.trim());
  
  // Usually the city is the second-to-last part before province
  for (let i = parts.length - 2; i >= 0; i--) {
    const part = parts[i];
    // Skip if it's a postal code or "Canada" or "ON"
    if (/^[A-Z]\d[A-Z]\s*\d[A-Z]\d$/i.test(part)) continue;
    if (/^(ON|Ontario|Canada)$/i.test(part)) continue;
    if (/^(ON\s+[A-Z]\d[A-Z]|[A-Z]\d[A-Z])$/i.test(part)) continue;
    
    // Check if it looks like a city name (letters, possibly with spaces)
    if (/^[A-Za-z\s'-]+$/.test(part) && part.length > 2) {
      return part;
    }
  }
  
  return "Toronto";
}

// Parse languages string into array
function parseLanguages(languagesStr: string): string[] {
  if (!languagesStr || languagesStr === "Nan") {
    return ["English"];
  }
  
  return languagesStr
    .split(",")
    .map((lang) => lang.trim())
    .filter((lang) => lang.length > 0)
    .map((lang) => {
      // Capitalize first letter of each language
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
    const csvDoctors = parseCSV(csvContent);
    console.log(`Parsed ${csvDoctors.length} doctors from CSV`);

    // Clear existing doctors if requested (replace mode)
    if (clearExisting) {
      console.log("Clearing existing doctors (replace mode)...");
      const { error: deleteError } = await supabase
        .from("doctors")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (deleteError) {
        console.error("Error clearing doctors:", deleteError);
        return new Response(
          JSON.stringify({ error: `Failed to clear existing doctors: ${deleteError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log("Existing doctors cleared");
    }

    // Get existing CPSO numbers to avoid duplicates (append mode)
    let existingCpsoNumbers = new Set<string>();
    if (!clearExisting) {
      console.log("Fetching existing CPSO numbers for duplicate detection...");
      const { data: existingDocs } = await supabase
        .from("doctors")
        .select("cpso_number")
        .not("cpso_number", "is", null);
      
      if (existingDocs) {
        existingCpsoNumbers = new Set(existingDocs.map(d => d.cpso_number).filter(Boolean));
        console.log(`Found ${existingCpsoNumbers.size} existing doctors with CPSO numbers`);
      }
    }

    // Transform and insert doctors in batches
    const batchSize = 100;
    let inserted = 0;
    let skipped = 0;
    let errors: string[] = [];

    for (let i = 0; i < csvDoctors.length; i += batchSize) {
      const batch = csvDoctors.slice(i, i + batchSize);
      
      // Filter out duplicates in append mode
      const filteredBatch = clearExisting 
        ? batch 
        : batch.filter(doc => {
            if (existingCpsoNumbers.has(doc.cpso_number)) {
              skipped++;
              return false;
            }
            return true;
          });
      
      if (filteredBatch.length === 0) {
        continue;
      }
      
      const transformedBatch = filteredBatch.map((doc) => ({
        cpso_number: doc.cpso_number,
        full_name: formatName(doc.full_name),
        clinic_name: extractClinicName(doc.address, doc.full_name),
        address: doc.address,
        city: extractCity(doc.google_formatted_address, doc.city),
        province: doc.province || "ON",
        postal_code: doc.postal_code,
        phone: doc.phone,
        latitude: parseFloat(doc.latitude),
        longitude: parseFloat(doc.longitude),
        accepting_status: "unknown" as const,
        status_verified_by: "community" as const,
        languages: parseLanguages(doc.languages),
        accessibility_features: [],
        age_groups_served: ["Adults"],
        virtual_appointments: false,
        claimed_by_doctor: false,
        community_report_count: 0,
      }));

      const { data, error } = await supabase
        .from("doctors")
        .insert(transformedBatch)
        .select("id");

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
      } else {
        inserted += data?.length || 0;
        console.log(`Inserted batch ${i / batchSize + 1}: ${data?.length || 0} doctors (total: ${inserted})`);
      }
    }

    const result = {
      success: errors.length === 0,
      inserted,
      skipped,
      total: csvDoctors.length,
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
