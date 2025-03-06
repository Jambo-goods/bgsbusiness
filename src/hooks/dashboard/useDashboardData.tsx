
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserSession } from "./useUserSession";
import { useRealTimeSubscriptions } from "./useRealTimeSubscriptions";
import { projects } from "@/data/projects";

export const useDashboardData = () => {
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    investmentTotal: number;
    projectsCount: number;
    walletBalance: number;
  } | null>(null);
  const [userInvestments, setUserInvestments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user session
  const { userId, isLoading: isSessionLoading } = useUserSession();
  
  const fetchUserData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch user profile data
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) {
        console.error("Profile fetch error:", profileError);
        
        // If profile doesn't exist, create a default one
        if (profileError.message.includes("contains 0 rows")) {
          const { data: sessionData } = await supabase.auth.getSession();
          const userMeta = sessionData.session?.user.user_metadata || {};
          
          // Create a default profile with data from the user metadata
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              first_name: userMeta.first_name || "Utilisateur",
              last_name: userMeta.last_name || "",
              email: sessionData.session?.user.email,
              investment_total: 0,
              projects_count: 0,
              wallet_balance: 0
            });
            
          if (insertError) {
            console.error("Error creating default profile:", insertError);
            toast.error("Erreur lors de la création du profil");
          } else {
            // Refetch the profile
            const { data: newProfileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
              
            if (newProfileData) {
              profileData = newProfileData;
            }
          }
        }
      }
      
      // Fetch user investments
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('investments')
        .select('project_id, amount, duration, yield_rate, date, status')
        .eq('user_id', userId)
        .order('date', { ascending: false });
        
      if (investmentsError) {
        console.error("Investments fetch error:", investmentsError);
      }
      
      // Get actual project details for each investment
      let userProjects = [];
      
      if (investmentsData && investmentsData.length > 0) {
        // Get unique project IDs
        const projectIds = [...new Set(investmentsData.map(inv => inv.project_id))];
        
        // Fetch project details from Supabase
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .in('id', projectIds);
          
        if (projectsError) {
          console.error("Projects fetch error:", projectsError);
        }
        
        if (projectsData) {
          // Combine with investment data
          userProjects = projectsData.map(project => {
            const investment = investmentsData.find(inv => inv.project_id === project.id);
            return {
              ...project,
              investedAmount: investment ? investment.amount : 0,
              investmentDate: investment ? investment.date : null
            };
          });
        }
      } else {
        // If no investments, show demo projects (only in development)
        userProjects = projects.slice(0, 3);
      }
      
      // Check for recent investment to add
      const recentInvestment = localStorage.getItem("recentInvestment");
      if (recentInvestment) {
        const investmentData = JSON.parse(recentInvestment);
        
        // Find the project in the projects list
        const project = projects.find(p => p.id === investmentData.projectId);
        
        // If the project exists and it's not already in the investments list
        if (project && !userProjects.some(i => i.id === project.id)) {
          // Add the project to the beginning of the list
          userProjects = [project, ...userProjects];
        }
        
        // Remove from local storage to prevent showing again on refresh
        localStorage.removeItem("recentInvestment");
      }
      
      // Use profile data if available, otherwise use default values
      const { data: sessionData } = await supabase.auth.getSession();
      
      setUserData({
        firstName: profileData?.first_name || sessionData.session?.user.user_metadata?.first_name || "Utilisateur",
        lastName: profileData?.last_name || sessionData.session?.user.user_metadata?.last_name || "",
        email: profileData?.email || sessionData.session?.user.email || "",
        phone: profileData?.phone || "",
        address: profileData?.address || "",
        investmentTotal: profileData?.investment_total || 0,
        projectsCount: profileData?.projects_count || 0,
        walletBalance: profileData?.wallet_balance || 0
      });
      
      setUserInvestments(userProjects);
      
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Erreur lors du chargement des données utilisateur");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Setup real-time subscriptions
  const { realTimeStatus } = useRealTimeSubscriptions({
    userId: userId || '',
    onProfileUpdate: fetchUserData,
    onInvestmentUpdate: fetchUserData,
    onTransactionUpdate: fetchUserData
  });
  
  useEffect(() => {
    window.scrollTo(0, 0);
    if (userId) {
      fetchUserData();
    }
  }, [userId, fetchUserData]);

  return {
    userData,
    userInvestments,
    isLoading: isLoading || isSessionLoading,
    realTimeStatus,
    refreshData: fetchUserData
  };
};
