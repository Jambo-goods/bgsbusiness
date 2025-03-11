
import { useState, useCallback } from "react";
import { toast } from "sonner";

type RefreshFunctions = {
  refreshProfileData: () => Promise<void>;
  refreshInvestmentsData: () => Promise<void>;
};

export function useDataRefresh({ refreshProfileData, refreshInvestmentsData }: RefreshFunctions) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAllData = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    toast.info("Actualisation des données...");
    
    try {
      await Promise.all([
        refreshProfileData(),
        refreshInvestmentsData()
      ]);
      toast.success("Données actualisées avec succès");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Erreur lors de l'actualisation des données");
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshProfileData, refreshInvestmentsData, isRefreshing]);

  return {
    isRefreshing,
    refreshAllData
  };
}
