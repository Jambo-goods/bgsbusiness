
import { useState, useEffect } from "react";
import { useUserSession } from "./useUserSession";
import { useRealTimeSubscriptions } from "./useRealTimeSubscriptions";
import { useProfileData } from "./useProfileData";
import { useInvestmentsData } from "./useInvestmentsData";
import { Project } from "@/types/project";
import { UserData } from "./types";

interface DashboardDataReturn {
  userData: UserData | null;
  userInvestments: Project[];
  isLoading: boolean;
  realTimeStatus: string;
  refreshData: () => Promise<void>;
}

export const useDashboardData = (): DashboardDataReturn => {
  // Get user session
  const { userId, isLoading: isSessionLoading } = useUserSession();
  
  // Get profile and investments data
  const { userData, isLoading: isProfileLoading, refreshProfileData } = useProfileData(userId);
  const { userInvestments, isLoading: isInvestmentsLoading, refreshInvestmentsData } = useInvestmentsData(userId);
  
  // Setup real-time subscriptions
  const { realTimeStatus } = useRealTimeSubscriptions({
    userId: userId || '',
    onProfileUpdate: refreshProfileData,
    onInvestmentUpdate: refreshInvestmentsData,
    onTransactionUpdate: refreshProfileData
  });
  
  // Combined refresh function
  const refreshData = async () => {
    await Promise.all([
      refreshProfileData(),
      refreshInvestmentsData()
    ]);
  };
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return {
    userData,
    userInvestments,
    isLoading: isSessionLoading || isProfileLoading || isInvestmentsLoading,
    realTimeStatus,
    refreshData
  };
};
