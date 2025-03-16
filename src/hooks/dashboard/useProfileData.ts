
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserData } from "./types";
import { toast } from "sonner";

export const useProfileData = (userId: string | null) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfileData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      console.log("Fetching profile data for user:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Erreur lors du chargement des données du profil");
        return;
      }

      // Transform the raw data to match the UserData interface
      const transformedData: UserData = {
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        email: data.email || "",
        investmentTotal: data.investment_total || 0,
        projectsCount: data.projects_count || 0,
        walletBalance: data.wallet_balance || 0,
      };

      console.log("Profile data fetched successfully, wallet balance:", data.wallet_balance);
      setUserData(transformedData);
    } catch (error) {
      console.error("Unexpected error in profile data fetch:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshProfileData();
    
    // Set up realtime subscription for the wallet balance
    if (userId) {
      console.log("Setting up profile data realtime subscription");
      
      const profileChannel = supabase
        .channel('profile-data-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`
          },
          (payload) => {
            console.log("Profile data updated in realtime:", payload);
            
            if (payload.new && userData) {
              // Only update if we have existing userData
              const updatedData = {
                ...userData,
                walletBalance: payload.new.wallet_balance || userData.walletBalance,
                investmentTotal: payload.new.investment_total || userData.investmentTotal,
                projectsCount: payload.new.projects_count || userData.projectsCount,
              };
              
              console.log("Updating profile data from realtime update:", updatedData);
              setUserData(updatedData);
            } else {
              // If we don't have userData yet, do a full refresh
              refreshProfileData();
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(profileChannel);
      };
    }
  }, [userId, refreshProfileData, userData]);

  return {
    userData,
    isLoading,
    refreshProfileData,
  };
};
