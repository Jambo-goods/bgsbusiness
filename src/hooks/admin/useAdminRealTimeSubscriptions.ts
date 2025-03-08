
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type RefreshCallback = () => void;

export function useAdminRealTimeSubscriptions(refreshCallback: RefreshCallback) {
  useEffect(() => {
    console.log("Setting up real-time subscriptions for admin dashboard...");
    
    // Profiles subscription (for user count)
    const profilesChannel = supabase
      .channel('admin_profiles_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        console.log('Profile data changed, refreshing admin dashboard...');
        refreshCallback();
      })
      .subscribe((status) => {
        console.log('Admin profiles subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to profiles table');
        }
      });
    
    // Investments subscription
    const investmentsChannel = supabase
      .channel('admin_investments_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments'
      }, () => {
        console.log('Investment data changed, refreshing admin dashboard...');
        refreshCallback();
      })
      .subscribe();
    
    // Projects subscription
    const projectsChannel = supabase
      .channel('admin_projects_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects'
      }, () => {
        console.log('Project data changed, refreshing admin dashboard...');
        refreshCallback();
      })
      .subscribe();
    
    // Withdrawal requests subscription
    const withdrawalsChannel = supabase
      .channel('admin_withdrawals_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawal_requests'
      }, () => {
        console.log('Withdrawal data changed, refreshing admin dashboard...');
        refreshCallback();
      })
      .subscribe();
    
    // Admin logs subscription
    const logsChannel = supabase
      .channel('admin_logs_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'admin_logs'
      }, () => {
        console.log('Admin logs changed, refreshing admin dashboard...');
        refreshCallback();
      })
      .subscribe();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up admin dashboard real-time subscriptions');
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(investmentsChannel);
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(withdrawalsChannel);
      supabase.removeChannel(logsChannel);
    };
  }, [refreshCallback]);
}
