
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardMain from "../components/dashboard/DashboardMain";
import { useProfileData } from "@/hooks/dashboard/useProfileData";
import { useInvestmentsData } from "@/hooks/dashboard/useInvestmentsData";
import { useRealTimeSubscriptions } from "@/hooks/dashboard/useRealTimeSubscriptions";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useDashboardState } from "@/hooks/dashboard/useDashboardState";
import { useUserSession } from "@/hooks/dashboard/useUserSession";
import { useDataRefresh } from "@/hooks/dashboard/useDataRefresh";
import DashboardStatusMapper from "@/components/dashboard/DashboardStatusMapper";
import { useInvestmentData } from "@/hooks/dashboard/useInvestmentData";

export default function Dashboard() {
  const { activeTab, setActiveTab } = useDashboardState();
  const { userId, handleLogout } = useUserSession();
  const { isSidebarOpen, setIsSidebarOpen, toggleSidebar } = useSidebarState();
  
  const { 
    userData, 
    isLoading: profileLoading, 
    refreshProfileData 
  } = useProfileData(userId);
  
  const { 
    userInvestments, 
    isLoading: investmentsLoading, 
    refreshInvestmentsData 
  } = useInvestmentsData(userId);
  
  const {
    investmentTotal,
    activeProjectsCount,
  } = useInvestmentData(userId);
  
  const { pollingStatus } = useRealTimeSubscriptions({
    userId: userId || '',
    onProfileUpdate: refreshProfileData,
    onInvestmentUpdate: refreshInvestmentsData,
    onTransactionUpdate: refreshProfileData
  });
  
  const {
    isRefreshing,
    refreshAllData
  } = useDataRefresh({
    refreshProfileData,
    refreshInvestmentsData
  });
  
  useEffect(() => {
    console.log("Dashboard polling status:", pollingStatus);
    
    const dataRefreshInterval = setInterval(() => {
      refreshAllData();
    }, 10 * 60 * 1000); // Refresh every 10 minutes
    
    return () => {
      clearInterval(dataRefreshInterval);
    };
  }, [pollingStatus, refreshAllData]);

  console.log("Current active tab (Dashboard.tsx):", activeTab);
  
  const mappedStatus = DashboardStatusMapper({ pollingStatus });

  return (
    <>
      <Helmet>
        <title>Tableau de bord | BGS Invest</title>
        <meta name="description" content="Gérez vos investissements et suivez vos rendements avec BGS Invest" />
      </Helmet>
      
      <DashboardLayout
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        realTimeStatus={mappedStatus}
        handleLogout={handleLogout}
      >
        <DashboardMain 
          isSidebarOpen={isSidebarOpen} 
          userData={{
            firstName: userData?.firstName || "",
            lastName: userData?.lastName || "",
            email: userData?.email || "",
            investmentTotal: investmentTotal, // Use real-time calculated value
            projectsCount: activeProjectsCount, // Use real-time calculated value
            walletBalance: userData?.walletBalance || 0
          }} 
          activeTab={activeTab} 
          userInvestments={userInvestments}
          setActiveTab={setActiveTab}
          refreshData={refreshAllData}
        />
      </DashboardLayout>
    </>
  );
}
