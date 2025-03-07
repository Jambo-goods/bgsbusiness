
import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardMain from "../components/dashboard/DashboardMain";
import { useProfileData } from "@/hooks/dashboard/useProfileData";
import { useInvestmentsData } from "@/hooks/dashboard/useInvestmentsData";
import { supabase } from "@/integrations/supabase/client";
import { useRealTimeSubscriptions } from "@/hooks/dashboard/useRealTimeSubscriptions";

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Fetch user ID from auth session - only once at component mount
  useEffect(() => {
    const fetchUserId = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        setUserId(sessionData.session.user.id);
      } else {
        console.log("No session or user ID found");
      }
    };
    
    fetchUserId();
  }, []);
  
  // User profile data
  const { 
    userData, 
    isLoading: profileLoading, 
    refreshProfileData 
  } = useProfileData(userId);
  
  // User investments data
  const { 
    userInvestments, 
    isLoading: investmentsLoading, 
    refreshInvestmentsData 
  } = useInvestmentsData(userId);
  
  // Set up real-time subscriptions when user ID is available
  const { realTimeStatus } = useRealTimeSubscriptions({
    userId: userId || '',
    onProfileUpdate: refreshProfileData,
    onInvestmentUpdate: refreshInvestmentsData,
    onTransactionUpdate: refreshProfileData  // Wallet balance is part of profile
  });
  
  // Log real-time status changes
  useEffect(() => {
    console.log("Dashboard real-time status:", realTimeStatus);
    
    if (realTimeStatus === 'connected') {
      toast.success("Données en temps réel activées", {
        id: "realtime-connected",
        description: "Vos données sont maintenant en temps réel."
      });
    } else if (realTimeStatus === 'error') {
      toast.error("Erreur de connexion", {
        id: "realtime-error",
        description: "Impossible de se connecter au temps réel."
      });
    }
  }, [realTimeStatus]);
  
  // Handle manual data refresh with debounce protection
  const refreshAllData = useCallback(async () => {
    toast.info("Actualisation des données...");
    await Promise.all([
      refreshProfileData(),
      refreshInvestmentsData()
    ]);
    toast.success("Données actualisées");
  }, [refreshProfileData, refreshInvestmentsData]);

  return (
    <>
      <Helmet>
        <title>Tableau de bord | BGS Invest</title>
      </Helmet>
      
      <DashboardLayout
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        realTimeStatus={realTimeStatus}
      >
        <DashboardMain 
          isSidebarOpen={isSidebarOpen} 
          userData={userData || {
            firstName: "",
            lastName: "",
            email: "",
            investmentTotal: 0,
            projectsCount: 0,
            walletBalance: 0
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
