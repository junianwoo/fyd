import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type DoctorRow = Database["public"]["Tables"]["doctors"]["Row"];
export type DoctorStatus = Database["public"]["Enums"]["accepting_status"];

export interface Doctor {
  id: string;
  cpsoNumber?: string;
  fullName: string;
  clinicName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  acceptingStatus: DoctorStatus;
  statusLastUpdatedAt: string;
  statusVerifiedBy: "doctor" | "community";
  languages: string[];
  accessibilityFeatures: string[];
  ageGroupsServed: string[];
  virtualAppointments: boolean;
  communityReportCount: number;
  claimedByDoctor: boolean;
}

export function mapDoctorRowToDoctor(row: DoctorRow): Doctor {
  return {
    id: row.id,
    cpsoNumber: (row as DoctorRow & { cpso_number?: string }).cpso_number || undefined,
    fullName: row.full_name,
    clinicName: row.clinic_name,
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
    statusVerifiedBy: row.status_verified_by || "community",
    languages: row.languages || ["English"],
    accessibilityFeatures: row.accessibility_features || [],
    ageGroupsServed: row.age_groups_served || ["Adults"],
    virtualAppointments: row.virtual_appointments || false,
    communityReportCount: row.community_report_count || 0,
    claimedByDoctor: row.claimed_by_doctor || false,
  };
}

export async function fetchDoctors(): Promise<Doctor[]> {
  // Fetch all doctors by paginating through results (Supabase has 1000 row limit)
  const allDoctors: DoctorRow[] = [];
  let page = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .order("full_name")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching doctors:", error);
      break;
    }

    if (!data || data.length === 0) break;
    
    allDoctors.push(...data);
    
    if (data.length < pageSize) break;
    page++;
  }

  return allDoctors.map(mapDoctorRowToDoctor);
}

export async function fetchDoctorById(id: string): Promise<Doctor | null> {
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching doctor:", error);
    return null;
  }

  return data ? mapDoctorRowToDoctor(data) : null;
}

export async function searchDoctors(query: string): Promise<Doctor[]> {
  const lowerQuery = query.toLowerCase();
  
  // Paginate through search results to bypass 1000 row limit
  const allDoctors: DoctorRow[] = [];
  let page = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .or(`city.ilike.%${lowerQuery}%,postal_code.ilike.%${lowerQuery}%,full_name.ilike.%${lowerQuery}%,clinic_name.ilike.%${lowerQuery}%`)
      .order("full_name")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error searching doctors:", error);
      break;
    }

    if (!data || data.length === 0) break;
    
    allDoctors.push(...data);
    
    if (data.length < pageSize) break;
    page++;
  }

  return allDoctors.map(mapDoctorRowToDoctor);
}

export async function filterDoctorsByStatus(
  doctors: Doctor[],
  status?: DoctorStatus | "all"
): Promise<Doctor[]> {
  if (!status || status === "all") return doctors;
  return doctors.filter((doctor) => doctor.acceptingStatus === status);
}

export async function submitCommunityReport(
  doctorId: string,
  reportedStatus: DoctorStatus,
  details?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("process-community-update", {
      body: {
        doctorId,
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
  doctorId: string,
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("claim-listing", {
      body: { doctorId, email },
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
