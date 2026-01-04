export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alert_settings: {
        Row: {
          accessibility_required: boolean | null
          city_postal: string
          created_at: string | null
          id: string
          is_active: boolean | null
          languages: string[] | null
          radius_km: number | null
          user_id: string
        }
        Insert: {
          accessibility_required?: boolean | null
          city_postal: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          radius_km?: number | null
          user_id: string
        }
        Update: {
          accessibility_required?: boolean | null
          city_postal?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          radius_km?: number | null
          user_id?: string
        }
        Relationships: []
      }
      community_reports: {
        Row: {
          details: string | null
          doctor_id: string
          id: string
          reported_at: string | null
          reported_status: Database["public"]["Enums"]["accepting_status"]
          reporter_ip: string | null
        }
        Insert: {
          details?: string | null
          doctor_id: string
          id?: string
          reported_at?: string | null
          reported_status: Database["public"]["Enums"]["accepting_status"]
          reporter_ip?: string | null
        }
        Update: {
          details?: string | null
          doctor_id?: string
          id?: string
          reported_at?: string | null
          reported_status?: Database["public"]["Enums"]["accepting_status"]
          reporter_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_reports_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          accepting_status: Database["public"]["Enums"]["accepting_status"]
          accessibility_features: string[] | null
          address: string
          age_groups_served: string[] | null
          city: string
          claimed_by_doctor: boolean | null
          clinic_name: string
          community_report_count: number | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          languages: string[] | null
          latitude: number
          longitude: number
          phone: string
          postal_code: string
          profile_last_updated_at: string | null
          province: string
          status_last_updated_at: string | null
          status_verified_by:
            | Database["public"]["Enums"]["verification_source"]
            | null
          virtual_appointments: boolean | null
          website: string | null
        }
        Insert: {
          accepting_status?: Database["public"]["Enums"]["accepting_status"]
          accessibility_features?: string[] | null
          address: string
          age_groups_served?: string[] | null
          city: string
          claimed_by_doctor?: boolean | null
          clinic_name: string
          community_report_count?: number | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          languages?: string[] | null
          latitude: number
          longitude: number
          phone: string
          postal_code: string
          profile_last_updated_at?: string | null
          province?: string
          status_last_updated_at?: string | null
          status_verified_by?:
            | Database["public"]["Enums"]["verification_source"]
            | null
          virtual_appointments?: boolean | null
          website?: string | null
        }
        Update: {
          accepting_status?: Database["public"]["Enums"]["accepting_status"]
          accessibility_features?: string[] | null
          address?: string
          age_groups_served?: string[] | null
          city?: string
          claimed_by_doctor?: boolean | null
          clinic_name?: string
          community_report_count?: number | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          languages?: string[] | null
          latitude?: number
          longitude?: number
          phone?: string
          postal_code?: string
          profile_last_updated_at?: string | null
          province?: string
          status_last_updated_at?: string | null
          status_verified_by?:
            | Database["public"]["Enums"]["verification_source"]
            | null
          virtual_appointments?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      pending_updates: {
        Row: {
          count: number
          created_at: string | null
          doctor_id: string
          id: string
          ip_addresses: string[]
          status: Database["public"]["Enums"]["accepting_status"]
          updated_at: string | null
        }
        Insert: {
          count?: number
          created_at?: string | null
          doctor_id: string
          id?: string
          ip_addresses?: string[]
          status: Database["public"]["Enums"]["accepting_status"]
          updated_at?: string | null
        }
        Update: {
          count?: number
          created_at?: string | null
          doctor_id?: string
          id?: string
          ip_addresses?: string[]
          status?: Database["public"]["Enums"]["accepting_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_updates_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          assisted_expires_at: string | null
          assisted_reason: string | null
          assisted_renewed_count: number | null
          created_at: string | null
          email: string
          id: string
          status: Database["public"]["Enums"]["user_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assisted_expires_at?: string | null
          assisted_reason?: string | null
          assisted_renewed_count?: number | null
          created_at?: string | null
          email: string
          id?: string
          status?: Database["public"]["Enums"]["user_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assisted_expires_at?: string | null
          assisted_reason?: string | null
          assisted_renewed_count?: number | null
          created_at?: string | null
          email?: string
          id?: string
          status?: Database["public"]["Enums"]["user_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          author_id: string | null
          category: string
          content: string | null
          created_at: string | null
          excerpt: string
          featured: boolean | null
          id: string
          published: boolean | null
          published_at: string | null
          read_time: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string
          content?: string | null
          created_at?: string | null
          excerpt: string
          featured?: boolean | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string | null
          created_at?: string | null
          excerpt?: string
          featured?: boolean | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_tokens: {
        Row: {
          created_at: string | null
          doctor_id: string
          email: string
          expires_at: string
          id: string
          token: string
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          doctor_id: string
          email: string
          expires_at: string
          id?: string
          token: string
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          doctor_id?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_tokens_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      accepting_status: "accepting" | "not_accepting" | "waitlist" | "unknown"
      app_role: "admin" | "moderator" | "user"
      user_status: "free" | "alert_service" | "assisted_access"
      verification_source: "doctor" | "community"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      accepting_status: ["accepting", "not_accepting", "waitlist", "unknown"],
      app_role: ["admin", "moderator", "user"],
      user_status: ["free", "alert_service", "assisted_access"],
      verification_source: ["doctor", "community"],
    },
  },
} as const
