
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserData } from "./types";

interface ProfileDataReturn {
  userData: UserData | null;
  isLoading: boolean;
  refreshProfileData: () => Promise<void>;
}

export const useProfileData = (userId: string | null): ProfileDataReturn => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch user profile data
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) {
        console.error("Profile fetch error:", profileError);
        
        // If profile doesn't exist, create a default one
        if (profileError.message.includes("contains 0 rows")) {
          const { data: sessionData } = await supabase.auth.getSession();
          const userMeta = sessionData.session?.user.user_metadata || {};
          
          // Fix: Use firstName and lastName from user_metadata directly
          const firstName = userMeta.firstName || "Utilisateur";
          const lastName = userMeta.lastName || "";
          
          // Create a default profile with data from the user metadata
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              first_name: firstName,
              last_name: lastName,
              email: sessionData.session?.user.email,
              investment_total: 0,
              projects_count: 0,
              wallet_balance: 0
            });
            
          if (insertError) {
            console.error("Error creating default profile:", insertError);
            toast.error("Erreur lors de la création du profil");
          } else {
            // Refetch the profile
            const { data: newProfileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
              
            if (newProfileData) {
              profileData = newProfileData;
            }
          }
        }
      }
      
      // Use profile data if available, otherwise use default values
      const { data: sessionData } = await supabase.auth.getSession();
      const userMeta = sessionData.session?.user.user_metadata || {};
      
      // Fix: Prioritize profile data, but fall back to user metadata if needed
      setUserData({
        firstName: profileData?.first_name || userMeta.firstName || "Utilisateur",
        lastName: profileData?.last_name || userMeta.lastName || "",
        email: profileData?.email || sessionData.session?.user.email || "",
        investmentTotal: profileData?.investment_total || 0,
        projectsCount: profileData?.projects_count || 0,
        walletBalance: profileData?.wallet_balance || 0
      });
      
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Erreur lors du chargement des données utilisateur");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId, fetchProfileData]);

  return {
    userData,
    isLoading,
    refreshProfileData: fetchProfileData
  };
};
