import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ClinicRow = Database["public"]["Tables"]["clinics"]["Row"];
export type ClinicStatus = Database["public"]["Enums"]["accepting_status"];

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  acceptingStatus: ClinicStatus;
  statusLastUpdatedAt: string;
  statusVerifiedBy: "clinic" | "community";
  languages: string[];
  accessibilityFeatures: string[];
  ageGroupsServed: string[];
  virtualAppointments: boolean;
  communityReportCount: number;
  claimedByClinic: boolean;
}

export function mapClinicRowToClinic(row: ClinicRow): Clinic {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    province: row.province,
    postalCode: row.postal_code,
    phone: row.phone,
    email: row.email || undefined,
    website: row.website || undefined,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    acceptingStatus: row.accepting_status,
    statusLastUpdatedAt: row.status_last_updated_at || new Date().toISOString(),
    statusVerifiedBy: row.status_verified_by === "clinic" ? "clinic" : "community",
    languages: row.languages || ["English"],
    accessibilityFeatures: row.accessibility_features || [],
    ageGroupsServed: row.age_groups_served || ["Adults"],
    virtualAppointments: row.virtual_appointments || false,
    communityReportCount: row.community_report_count || 0,
    claimedByClinic: row.claimed_by_clinic || false,
  };
}

export async function fetchClinics(): Promise<Clinic[]> {
  // Fetch all clinics by paginating through results (Supabase has 1000 row limit)
  const allClinics: ClinicRow[] = [];
  let page = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from("clinics")
      .select("*")
      .order("name")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching clinics:", error);
      break;
    }

    if (!data || data.length === 0) break;
    
    allClinics.push(...data);
    
    if (data.length < pageSize) break;
    page++;
  }

  return allClinics.map(mapClinicRowToClinic);
}

export async function fetchClinicById(id: string): Promise<Clinic | null> {
  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching clinic:", error);
    return null;
  }

  return data ? mapClinicRowToClinic(data) : null;
}

// Geocode a postal code or city to lat/lng coordinates using Google Maps API
async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Try client-side API key first
    let apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    // If not available, fetch from edge function
    if (!apiKey) {
      const response = await supabase.functions.invoke("get-maps-key");
      if (response.error) throw response.error;
      apiKey = response.data?.apiKey;
    }
    
    if (!apiKey) {
      console.error("No Google Maps API key available");
      return null;
    }
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)},Ontario,Canada&key=${apiKey}`
    );
    const data = await response.json();
    
    if (data.status === 'OK' && data.results?.[0]) {
      return data.results[0].geometry.location;
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Analyze postal code to determine type and validity
export function analyzePostalCode(query: string): { 
  isPostalCode: boolean; 
  isFull: boolean; 
  isPartial: boolean;
  isInvalid: boolean;
  cleaned: string;
} {
  const cleaned = query.replace(/\s+/g, '').toUpperCase();
  
  // Canadian postal code must be exactly 3 or 6 characters after cleaning
  const isFull = /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(cleaned);
  const isPartial = /^[A-Z]\d[A-Z]$/.test(cleaned);
  const isPostalCode = isFull || isPartial || (cleaned.length >= 2 && /^[A-Z]\d/.test(cleaned));
  const isInvalid = cleaned.length >= 4 && cleaned.length <= 5 && /^[A-Z]\d[A-Z]/.test(cleaned);
  
  return { isPostalCode, isFull, isPartial, isInvalid, cleaned };
}

export async function searchClinics(query: string): Promise<{ clinics: Clinic[]; searchLocation: { lat: number; lng: number } | null }> {
  const cleanedQuery = query.trim();
  if (!cleanedQuery) {
    return { clinics: [], searchLocation: null };
  }
  
  const lowerQuery = cleanedQuery.toLowerCase();
  const postalAnalysis = analyzePostalCode(cleanedQuery);
  
  // INVALID POSTAL CODE (4-5 chars): Return empty results
  if (postalAnalysis.isInvalid) {
    console.log('Invalid postal code length (4-5 chars):', postalAnalysis.cleaned);
    return { clinics: [], searchLocation: null };
  }
  
  let searchLocation: { lat: number; lng: number } | null = null;
  let shouldLoadAllClinics = false;
  let postalPrefix = '';
  
  // FULL POSTAL CODE (6 chars): Try geocoding first
  if (postalAnalysis.isFull) {
    searchLocation = await geocodeLocation(postalAnalysis.cleaned);
    
    if (searchLocation) {
      // Geocoding succeeded - load all clinics for radius filtering
      shouldLoadAllClinics = true;
    } else {
      // Geocoding failed - fall back to first 3 char prefix match
      postalPrefix = postalAnalysis.cleaned.substring(0, 3);
    }
  }
  
  // PARTIAL POSTAL CODE (3 chars): Use prefix match
  if (postalAnalysis.isPartial) {
    postalPrefix = postalAnalysis.cleaned;
  }
  
  // CITY NAME: Try geocoding
  if (!postalAnalysis.isPostalCode) {
    searchLocation = await geocodeLocation(cleanedQuery);
    if (searchLocation) {
      shouldLoadAllClinics = true;
    }
  }
  
  const allClinics: ClinicRow[] = [];
  let page = 0;
  const pageSize = 1000;
  
  // Load clinics based on search strategy
  while (true) {
    let queryBuilder = supabase.from("clinics").select("*");
    
    if (shouldLoadAllClinics) {
      // Load all clinics - will be filtered by distance in frontend
      // No filters applied
    } else if (postalPrefix) {
      // 3-char prefix match
      queryBuilder = queryBuilder.ilike("postal_code", `${postalPrefix}%`);
    } else if (!postalAnalysis.isPostalCode) {
      // City/name search
      queryBuilder = queryBuilder.or(
        `city.ilike.%${lowerQuery}%,name.ilike.%${lowerQuery}%`
      );
    }
    
    const { data, error } = await queryBuilder
      .order("name")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error searching clinics:", error);
      break;
    }

    if (!data || data.length === 0) break;
    
    allClinics.push(...data);
    
    if (data.length < pageSize) break;
    page++;
  }

  const clinics = allClinics.map(mapClinicRowToClinic);
  
  // If we didn't geocode, use first clinic's location as fallback
  if (!searchLocation && clinics.length > 0) {
    searchLocation = {
      lat: clinics[0].latitude,
      lng: clinics[0].longitude,
    };
  }

  return { clinics, searchLocation };
}

export async function filterClinicsByStatus(
  clinics: Clinic[],
  status?: ClinicStatus | "all"
): Promise<Clinic[]> {
  if (!status || status === "all") return clinics;
  return clinics.filter((clinic) => clinic.acceptingStatus === status);
}

export async function submitCommunityReport(
  clinicId: string,
  reportedStatus: ClinicStatus,
  details?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("process-community-update", {
      body: {
        clinicId,
        reportedStatus,
        details: details || null,
        reporterIp: null, // IP will be captured server-side if needed
      },
    });

    if (error) {
      console.error("Error submitting community report:", error);
      return { success: false, message: error.message };
    }

    return { 
      success: data?.success || false, 
      message: data?.message || "Thank you for your update!" 
    };
  } catch (err: any) {
    console.error("Error submitting community report:", err);
    return { success: false, message: err.message || "Failed to submit report" };
  }
}

export async function claimListing(
  clinicId: string,
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("claim-listing", {
      body: { clinicId, email },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { 
      success: data?.success || false, 
      message: data?.message || "Verification email sent!" 
    };
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to send verification email" };
  }
}
