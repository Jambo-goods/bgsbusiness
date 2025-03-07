
import { Project } from "@/types/project";
import DashboardCards from "./overview/DashboardCards";
import ChartsSection from "./overview/ChartsSection";
import RecentProjects from "./RecentProjects";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OverviewProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    investmentTotal: number;
    projectsCount: number;
  };
  userInvestments: Project[];
  setActiveTab: (tab: string) => void;
}

export default function Overview({ userData, userInvestments, setActiveTab }: OverviewProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [realTimeStatus, setRealTimeStatus] = useState('connecting');
  
  // Check local storage for recent investment
  useEffect(() => {
    const recentInvestment = localStorage.getItem("recentInvestment");
    if (recentInvestment) {
      // Parse the stored investment data
      const investmentData = JSON.parse(recentInvestment);
      
      // Show success toast
      toast({
        title: "Investissement réussi !",
        description: `Votre investissement de ${investmentData.amount}€ dans ${investmentData.projectName} a été enregistré.`,
      });
      
      // Remove from local storage to prevent showing again on refresh
      localStorage.removeItem("recentInvestment");
      
      // Set state to indicate new investment
      setShowSuccess(true);
    }
    
    // Set up real-time check with better error handling
    const setupRealTimeCheck = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data && data.session) {
          const channel = supabase
            .channel('overview_realtime_check')
            .subscribe((status) => {
              console.log('Overview realtime status check:', status);
              if (status === 'SUBSCRIBED') {
                setRealTimeStatus('connected');
              } else if (status === 'CHANNEL_ERROR') {
                setRealTimeStatus('error');
              }
            });
            
          return () => {
            supabase.removeChannel(channel);
          };
        }
      } catch (error) {
        console.error("Error setting up real-time connection:", error);
        setRealTimeStatus('error');
      }
    };
    
    const cleanup = setupRealTimeCheck();
    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => {
          if (cleanupFn) cleanupFn();
        });
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-700 p-4 rounded-lg mb-4 animate-fade-in">
          <p className="font-medium">Nouvel investissement ajouté avec succès!</p>
          <p className="text-sm">Vous pouvez voir les détails dans la section Investissements.</p>
        </div>
      )}
      
      {process.env.NODE_ENV === 'development' && (
        <div className="text-right mb-2">
          <div className="inline-flex items-center bg-white px-2 py-1 rounded text-xs">
            <div className={`h-1.5 w-1.5 rounded-full mr-1 ${
              realTimeStatus === 'connected' ? 'bg-green-500' : 
              realTimeStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-gray-500">
              {realTimeStatus === 'connected' ? 'Données en temps réel' : 
               realTimeStatus === 'error' ? 'Mode hors ligne' : 'Connexion...'}
            </span>
          </div>
        </div>
      )}
      
      <DashboardCards userData={userData} />
      {userInvestments.length > 0 && <ChartsSection setActiveTab={setActiveTab} />}
      {userInvestments.length > 0 && <RecentProjects userInvestments={userInvestments} setActiveTab={setActiveTab} />}
    </div>
  );
}
