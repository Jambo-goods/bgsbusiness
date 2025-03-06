
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWalletData } from "./useWalletData";
import { useInvestmentData } from "./useInvestmentData";
import { useYieldData } from "./useYieldData";
import { DashboardCardData, UserData } from "./types";

export const useDashboardData = (userData: UserData) => {
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    // Get current user ID
    const fetchUserId = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session.session) {
          setUserId(session.session.user.id);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };
    
    fetchUserId();
    
    // Set up realtime subscriptions for relevant tables
    const setupRealtimeSubscriptions = () => {
      // Wallet transactions
      const walletChannel = supabase
        .channel('wallet_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions'
        }, () => {
          console.log('Wallet transaction detected, refreshing data...');
        })
        .subscribe();
        
      // Investments
      const investmentsChannel = supabase
        .channel('investment_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'investments'
        }, () => {
          console.log('Investment change detected, refreshing data...');
        })
        .subscribe();
        
      // Profiles
      const profilesChannel = supabase
        .channel('profile_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles'
        }, () => {
          console.log('Profile change detected, refreshing data...');
        })
        .subscribe();
        
      // Projects
      const projectsChannel = supabase
        .channel('project_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'projects'
        }, () => {
          console.log('Project change detected, refreshing data...');
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(walletChannel);
        supabase.removeChannel(investmentsChannel);
        supabase.removeChannel(profilesChannel);
        supabase.removeChannel(projectsChannel);
      };
    };
    
    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, []);

  return {
    userId
  };
};
