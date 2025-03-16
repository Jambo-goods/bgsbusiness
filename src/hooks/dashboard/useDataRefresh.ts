
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

  const refreshAllData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      console.log("Refreshing all dashboard data...");
      
      // Refresh profile data first (contains wallet balance)
      await refreshProfileData();
      
      // Then refresh investments data
      await refreshInvestmentsData();
      
      console.log("All dashboard data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
      toast.error("Erreur lors de l'actualisation des données");
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshProfileData, refreshInvestmentsData]);

  return {
    isRefreshing,
    refreshAllData
  };
};
