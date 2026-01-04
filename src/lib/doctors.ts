import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type DoctorRow = Database["public"]["Tables"]["doctors"]["Row"];
export type DoctorStatus = Database["public"]["Enums"]["accepting_status"];

export interface Doctor {
  id: string;
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
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .order("full_name");

  if (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }

  return (data || []).map(mapDoctorRowToDoctor);
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
  
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .or(`city.ilike.%${lowerQuery}%,postal_code.ilike.%${lowerQuery}%,full_name.ilike.%${lowerQuery}%,clinic_name.ilike.%${lowerQuery}%`)
    .order("full_name");

  if (error) {
    console.error("Error searching doctors:", error);
    return [];
  }

  return (data || []).map(mapDoctorRowToDoctor);
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
): Promise<boolean> {
  const { error } = await supabase.from("community_reports").insert({
    doctor_id: doctorId,
    reported_status: reportedStatus,
    details: details || null,
  });

  if (error) {
    console.error("Error submitting community report:", error);
    return false;
  }

  // Increment the community report count and update status
  const { error: updateError } = await supabase
    .from("doctors")
    .update({
      accepting_status: reportedStatus,
      status_last_updated_at: new Date().toISOString(),
      status_verified_by: "community",
      community_report_count: supabase.rpc ? undefined : undefined, // Will handle this with RPC later
    })
    .eq("id", doctorId);

  if (updateError) {
    console.error("Error updating doctor status:", updateError);
  }

  return !error;
}
