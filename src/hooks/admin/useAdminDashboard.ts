
import { useState, useEffect, useCallback } from "react";
import { AdminStats, AdminLog } from "./types";
import { fetchAdminDashboardData } from "./useAdminDataFetching";
import { toast } from "sonner";

// Use 'export type' instead of 'export' for type re-exports
export type { AdminStats, AdminLog } from "./types";

export function useAdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    userCount: 0,
    totalInvestments: 0,
    totalProjects: 0,
    pendingWithdrawals: 0,
    ongoingProjects: 0
  });
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      const { stats: newStats, logs } = await fetchAdminDashboardData();
      
      setStats(newStats);
      setAdminLogs(logs);
      
    } catch (error) {
      console.error("Error in fetchDashboardData:", error);
      toast.error("Erreur lors du chargement des données", {
        description: "Impossible de charger les données du tableau de bord."
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    adminLogs,
    isLoading,
    isRefreshing,
    refreshData: fetchDashboardData
  };
}
