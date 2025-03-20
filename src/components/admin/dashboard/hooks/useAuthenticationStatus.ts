
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuthenticationStatus() {
  const [authStatus, setAuthStatus] = useState<string>("checking");
  const [userRole, setUserRole] = useState<string>("unknown");
  
  // Check authentication status at startup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Erreur d'authentification:", error.message);
          setAuthStatus("error");
          return;
        }
        
        setAuthStatus(data.session ? "authenticated" : "not authenticated");
        if (data.session) {
          // Check if the user is admin
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            const role = userData.user.app_metadata?.role || "utilisateur";
            setUserRole(role);
            console.log("Rôle utilisateur:", role);
          }
        }
      } catch (e) {
        console.error("Erreur lors de la vérification d'auth:", e);
        setAuthStatus("error");
      }
    };
    
    checkAuth();
  }, []);

  return { authStatus, userRole };
}
