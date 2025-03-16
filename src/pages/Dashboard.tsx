
import { useEffect, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { activeTab, setActiveTab } = useDashboardState();
  const { userId, sessionChecked, handleLogout } = useUserSession();
  const { isSidebarOpen, setIsSidebarOpen, toggleSidebar } = useSidebarState();
  const [hasShownNoSession, setHasShownNoSession] = useState(false);
  
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
  
  const { pollingStatus } = useRealTimeSubscriptions({
    userId: userId || '',
    onProfileUpdate: refreshProfileData,
    onInvestmentUpdate: refreshInvestmentsData,
    onTransactionUpdate: refreshProfileData,
    pollingInterval: 30000 // Reduce polling interval to 30 seconds
  });
  
  const {
    isRefreshing,
    refreshAllData
  } = useDataRefresh({
    refreshProfileData,
    refreshInvestmentsData
  });
  
  useEffect(() => {
    // Set up direct wallet balance subscription only once when userId is available
    if (userId) {
      console.log("Setting up dashboard wallet balance subscription");
      
      const walletBalanceChannel = supabase
        .channel('dashboard-wallet-balance')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`
          },
          (payload) => {
            if (payload.new && typeof payload.new.wallet_balance === 'number') {
              console.log("Dashboard detected wallet balance change:", payload.new.wallet_balance);
              
              // Force refresh profile data
              refreshProfileData();
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(walletBalanceChannel);
      };
    }
  }, [userId, refreshProfileData]);

  useEffect(() => {
    // Only refresh data periodically when we have a userId
    if (userId) {
      const dataRefreshInterval = setInterval(() => {
        refreshAllData();
      }, 5 * 60 * 1000); // Refresh every 5 minutes
      
      return () => {
        clearInterval(dataRefreshInterval);
      };
    }
  }, [userId, refreshAllData]);

  // Show no session message only once after session check completes
  useEffect(() => {
    if (sessionChecked && !userId && !hasShownNoSession) {
      setHasShownNoSession(true);
    }
  }, [sessionChecked, userId, hasShownNoSession]);

  console.log("Current active tab (Dashboard.tsx):", activeTab);
  
  const mappedStatus = DashboardStatusMapper({ pollingStatus });

  // Prepare user data with userId for transaction history
  const enhancedUserData = userData ? {
    ...userData,
    userId: userId || ''
  } : {
    firstName: "",
    lastName: "",
    email: "",
    investmentTotal: 0,
    projectsCount: 0,
    walletBalance: 0,
    userId: userId || ''
  };

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
          userData={enhancedUserData}
          activeTab={activeTab} 
          userInvestments={userInvestments}
          setActiveTab={setActiveTab}
          refreshData={refreshAllData}
        />
      </DashboardLayout>
    </>
  );
}
