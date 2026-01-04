import { supabase } from "@/integrations/supabase/client";

export interface Resource {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string | null;
  category: string;
  read_time: string;
  featured: boolean;
  published: boolean;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export type ResourceInsert = Omit<Resource, "id" | "created_at" | "updated_at">;
export type ResourceUpdate = Partial<ResourceInsert>;

export async function fetchResources(includeUnpublished: boolean = false): Promise<Resource[]> {
  let query = supabase.from("resources").select("*").order("created_at", { ascending: false });
  
  if (!includeUnpublished) {
    query = query.eq("published", true);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error("Error fetching resources:", error);
    return [];
  }

  return data || [];
}

export async function fetchResourceBySlug(slug: string): Promise<Resource | null> {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching resource:", error);
    return null;
  }

  return data;
}

export async function fetchResourceById(id: string): Promise<Resource | null> {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching resource:", error);
    return null;
  }

  return data;
}

export async function createResource(resource: ResourceInsert): Promise<{ success: boolean; error?: string; data?: Resource }> {
  const { data, error } = await supabase
    .from("resources")
    .insert(resource)
    .select()
    .single();

  if (error) {
    console.error("Error creating resource:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateResource(id: string, resource: ResourceUpdate): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("resources")
    .update(resource)
    .eq("id", id);

  if (error) {
    console.error("Error updating resource:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteResource(id: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("resources")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting resource:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
