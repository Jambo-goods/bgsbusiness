
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useUserSession() {
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  useEffect(() => {
    // Only fetch once on mount to prevent infinite loops
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
        setSessionChecked(true);
      } catch (error) {
        console.error("Error fetching user session:", error);
        setSessionChecked(true);
      }
    };
    
    // Only fetch on mount, not on every render
    if (!sessionChecked) {
      fetchUserId();
    }
    
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
  }, [sessionChecked]);

  const handleLogout = async () => {
    try {
      // Clear all app state first
      setUserId(null);
      
      // Clear all localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out from Supabase - ignore errors if session is already cleared
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (e) {
        console.log("Session may already be cleared:", e);
        // Continue with logout flow even if there's an error
      }
      
      toast.success("Déconnexion réussie");
      
      // Force reload and redirect to login page
      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
      
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Erreur lors de la déconnexion");
      
      // Force reload even on error as a fallback
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  };

  return {
    userId,
    sessionChecked,
    handleLogout
  };
}
