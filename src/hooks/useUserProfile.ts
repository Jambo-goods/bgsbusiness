
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  wallet_balance?: number;
  created_at?: string;
}

export default function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        setIsLoading(true);
        
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setProfile(null);
          setError("No authenticated user");
          return;
        }
        
        // Fetch user profile data
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        // If profile exists, use it directly
        if (data) {
          setProfile(data as UserProfile);
        } else {
          // If no profile exists, create one with user metadata
          const userMeta = session.user.user_metadata || {};
          
          // Extract firstName and lastName from user metadata
          const firstName = userMeta.firstName || "Utilisateur";
          const lastName = userMeta.lastName || "";
          
          // Create a new profile with metadata values
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: session.user.id,
              email: session.user.email,
              first_name: firstName,
              last_name: lastName
            })
            .select()
            .single();
            
          if (insertError) {
            throw insertError;
          }
          
          setProfile(newProfile as UserProfile);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserProfile();
    
    // Set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUserProfile();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { profile, isLoading, error };
}
