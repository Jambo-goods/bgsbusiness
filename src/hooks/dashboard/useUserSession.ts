
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
    
    // Set up an auth state change listener
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
      // First, clear all localStorage items related to authentication
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('supabase.auth.token');
      
      // Set userId to null immediately to update UI
      setUserId(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Déconnexion réussie");
      
      // Force redirect to login page after ensuring the state is cleared
      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
      
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
