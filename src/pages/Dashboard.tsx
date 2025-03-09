import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { useLocation, useSearchParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardMain from "../components/dashboard/DashboardMain";
import { useProfileData } from "@/hooks/dashboard/useProfileData";
import { useInvestmentsData } from "@/hooks/dashboard/useInvestmentsData";
import { supabase } from "@/integrations/supabase/client";
import { useRealTimeSubscriptions } from "@/hooks/dashboard/useRealTimeSubscriptions";
import { useSidebarState } from "@/hooks/useSidebarState";

export default function Dashboard() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      console.log(`Setting initial tab from URL param: ${tabParam}`);
      return tabParam;
    }
    
    if (location.state && location.state.activeTab) {
      console.log(`Setting initial tab from location state: ${location.state.activeTab}`);
      return location.state.activeTab;
    }
    
    return 'overview';
  });
  
  const { isSidebarOpen, setIsSidebarOpen, toggleSidebar } = useSidebarState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      console.log(`Updating tab from URL param change: ${tabParam}`);
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      console.log(`Updating tab from location state change: ${location.state.activeTab}`);
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);
  
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          setUserId(sessionData.session.user.id);
          console.log("User ID set:", sessionData.session.user.id);
        } else {
          console.log("No session or user ID found");
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
        toast.error("Erreur de connexion", {
          description: "Impossible de récupérer vos informations utilisateur."
        });
      }
    };
    
    fetchUserId();
  }, []);
  
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
  
  const { realTimeStatus } = useRealTimeSubscriptions({
    userId: userId || '',
    onProfileUpdate: refreshProfileData,
    onInvestmentUpdate: refreshInvestmentsData,
    onTransactionUpdate: refreshProfileData
  });
  
  useEffect(() => {
    console.log("Dashboard real-time status:", realTimeStatus);
    
    if (realTimeStatus === 'connected') {
      toast.success("Données en temps réel activées", {
        id: "realtime-connected",
        description: "Vos données sont maintenant synchronisées en temps réel."
      });
    } else if (realTimeStatus === 'error') {
      toast.error("Erreur de connexion", {
        id: "realtime-error",
        description: "Impossible de se connecter au temps réel. Vos données ne seront pas automatiquement mises à jour."
      });
    }
  }, [realTimeStatus]);
  
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Déconnexion réussie");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  console.log("Current active tab (Dashboard.tsx):", activeTab);

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
        realTimeStatus={realTimeStatus}
        handleLogout={handleLogout}
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
