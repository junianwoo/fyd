import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type UserStatus = "free" | "alert_service" | "assisted_access";

interface UserStatusData {
  status: UserStatus;
  isLoading: boolean;
  isPaidUser: boolean;
}

export function useUserStatus(): UserStatusData {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<UserStatus>("free");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setStatus("free");
      setIsLoading(false);
      return;
    }

    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("status, assisted_expires_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user status:", error);
        setStatus("free");
      } else if (data) {
        // Check if assisted access is still valid
        if (data.status === "assisted_access" && data.assisted_expires_at) {
          const isExpired = new Date(data.assisted_expires_at) < new Date();
          setStatus(isExpired ? "free" : data.status);
        } else {
          setStatus(data.status || "free");
        }
      } else {
        setStatus("free");
      }
      
      setIsLoading(false);
    };

    fetchStatus();
  }, [user, authLoading]);

  const isPaidUser = status === "alert_service" || status === "assisted_access";

  return { status, isLoading, isPaidUser };
}
