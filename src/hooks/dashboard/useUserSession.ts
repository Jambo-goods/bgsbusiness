
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
          setUserId(null);
          console.log("No session or user ID found");
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
      }
    };
    
    fetchUserId();
    
    // Set up an auth state change listener instead of using polling
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        if (event === "SIGNED_IN" && session?.user) {
          setUserId(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setUserId(null);
        }
      }
    );
    
    return () => {
      // Clean up the auth listener when component unmounts
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear localStorage items related to authentication
      localStorage.removeItem('isLoggedIn');
      
      // Set userId to null immediately
      setUserId(null);
      
      // Navigate to login page
      window.location.href = "/login";
      
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return {
    userId,
    handleLogout
  };
}
