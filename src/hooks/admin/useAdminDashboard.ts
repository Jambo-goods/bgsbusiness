
import { useState, useEffect, useCallback } from "react";
import { AdminStats, AdminLog, RealTimeStatus } from "./types";
import { fetchAdminDashboardData } from "./useAdminDataFetching";
import { toast } from "sonner";

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
  const [realTimeStatus, setRealTimeStatus] = useState<RealTimeStatus>('connecting');

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      const { stats: newStats, logs } = await fetchAdminDashboardData();
      
      setStats(newStats);
      setAdminLogs(logs);
      setRealTimeStatus('connected');
      
    } catch (error) {
      console.error("Error in fetchDashboardData:", error);
      setRealTimeStatus('error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // No real-time subscriptions are set up anymore

  return {
    stats,
    adminLogs,
    isLoading,
    isRefreshing,
    realTimeStatus,
    refreshData: fetchDashboardData
  };
}
