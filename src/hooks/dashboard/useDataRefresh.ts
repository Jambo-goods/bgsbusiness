
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface DataRefreshProps {
  refreshProfileData: () => Promise<void>;
  refreshInvestmentsData: () => Promise<void>;
}

export const useDataRefresh = ({
  refreshProfileData,
  refreshInvestmentsData
}: DataRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshAttempt, setLastRefreshAttempt] = useState(0);

  const refreshAllData = useCallback(async () => {
    try {
      // Prevent rapid repeated refreshes
      const now = Date.now();
      if (now - lastRefreshAttempt < 5000) {
        console.log("Refresh throttled - too soon since last attempt");
        return;
      }
      
      setLastRefreshAttempt(now);
      setIsRefreshing(true);
      
      console.log("Refreshing all dashboard data...");
      
      // Set up a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Refresh timeout")), 15000);
      });
      
      // Refresh profile data first (contains wallet balance)
      await Promise.race([
        refreshProfileData(),
        timeoutPromise
      ]);
      
      // Then refresh investments data
      await Promise.race([
        refreshInvestmentsData(),
        timeoutPromise
      ]);
      
      console.log("All dashboard data refreshed successfully");
      
      // Show success toast only if not throttled
      if (now - lastRefreshAttempt >= 5000) {
        toast.success("Données actualisées", {
          description: "Vos données ont été actualisées avec succès"
        });
      }
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
      toast.error("Erreur lors de l'actualisation des données", {
        description: "Veuillez réessayer dans quelques instants"
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshProfileData, refreshInvestmentsData, lastRefreshAttempt]);

  return {
    isRefreshing,
    refreshAllData
  };
};
