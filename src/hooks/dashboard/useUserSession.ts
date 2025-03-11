
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserSession() {
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          setUserId(sessionData.session.user.id);
          console.log("User ID set:", sessionData.session.user.id);
        } else {
          console.log("No session or user ID found");
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
      }
    };
    
    fetchUserId();
    
    const refreshInterval = setInterval(fetchUserId, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    userId,
    handleLogout
  };
}
