
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import DashboardLayout from "./DashboardLayout";
import DashboardMain from "./DashboardMain";
import DashboardLoading from "./DashboardLoading";
import { useDashboardState } from "@/hooks/dashboard/useDashboardState";
import { useReferralRewards } from "@/hooks/useReferralRewards";

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [userInvestments, setUserInvestments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeTab, setActiveTab } = useDashboardState();
  
  // Initialize the referral rewards listener
  useReferralRewards();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("Utilisateur non connecté");
          return;
        }

        // Fetch user profile from the profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }

        // Combine auth user and profile data
        setUserData({
          ...user,
          ...profile,
        });
        
        // Fetch user's investments
        const { data: investments, error: investmentsError } = await supabase
          .from('investments')
          .select(`
            *,
            project:project_id (
              id,
              name,
              image,
              company_name,
              description,
              yield,
              status
            )
          `)
          .eq('user_id', user.id);
          
        if (investmentsError) {
          throw investmentsError;
        }
        
        setUserInvestments(investments || []);
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(err.message || "Une erreur est survenue lors du chargement des données");
        toast.error("Erreur de chargement", {
          description: "Impossible de charger les données utilisateur"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
    
    // Set up real-time subscription for profile changes
    const channel = supabase
      .channel('dashboard-profile-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles' }, 
        (payload) => {
          // Update user data when profile changes
          if (payload.new && userData && (payload.new as any).id === userData.id) {
            setUserData({
              ...userData,
              ...(payload.new as any),
            });
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Utilisateur non connecté");
        return;
      }

      // Fetch user's investments
      const { data: investments, error: investmentsError } = await supabase
        .from('investments')
        .select(`
          *,
          project:project_id (
            id,
            name,
            image,
            company_name,
            description,
            yield,
            status
          )
        `)
        .eq('user_id', user.id);
        
      if (investmentsError) {
        throw investmentsError;
      }
      
      setUserInvestments(investments || []);
      
      // Refresh profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        throw profileError;
      }

      setUserData({
        ...userData,
        ...profile,
      });
      
      toast.success("Données actualisées");
    } catch (err: any) {
      console.error("Error refreshing data:", err);
      toast.error("Erreur de chargement", {
        description: "Impossible d'actualiser les données"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = "/login"}
            className="px-4 py-2 bg-bgs-blue text-white rounded-lg hover:bg-bgs-blue-light transition-colors"
          >
            Retour à la page de connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      userData={userData}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <Routes>
        <Route 
          path="/:tab" 
          element={
            <DashboardMain 
              activeTab={activeTab}
              userData={userData}
              userInvestments={userInvestments}
              setActiveTab={setActiveTab}
              refreshData={refreshData}
            />
          } 
        />
        <Route
          path="/"
          element={<Navigate to="/dashboard/overview" replace />}
        />
      </Routes>
    </DashboardLayout>
  );
}
