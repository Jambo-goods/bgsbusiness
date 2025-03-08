
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminStats {
  userCount: number;
  totalInvestments: number;
  totalProjects: number;
  pendingWithdrawals: number;
  ongoingProjects: number; // Added for ongoing projects
}

export interface AdminLog {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  admin_id: string;
  admin_users?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    userCount: 0,
    totalInvestments: 0,
    totalProjects: 0,
    pendingWithdrawals: 0,
    ongoingProjects: 0 // Added for ongoing projects
  });
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [realTimeStatus, setRealTimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      console.log("Fetching admin dashboard data...");
      
      // Get user count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (userError) throw userError;
      
      // Get total investments
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('investments')
        .select('amount');
      
      if (investmentsError) throw investmentsError;
      
      const totalInvestments = investmentsData?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
      
      // Get total projects
      const { count: totalProjects, error: projectsError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });
      
      if (projectsError) throw projectsError;
      
      // Get ongoing projects (with status 'active' or 'in_progress')
      const { count: ongoingProjects, error: ongoingProjectsError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .in('status', ['active', 'in_progress']);
      
      if (ongoingProjectsError) throw ongoingProjectsError;
      
      // Get pending withdrawals
      const { count: pendingWithdrawals, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (withdrawalsError) throw withdrawalsError;
      
      // Get recent admin logs
      const { data: logsData, error: logsError } = await supabase
        .from('admin_logs')
        .select(`
          *,
          admin_users(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (logsError) throw logsError;
      
      // Update state with fetched data
      setStats({
        userCount: userCount || 0,
        totalInvestments,
        totalProjects: totalProjects || 0,
        pendingWithdrawals: pendingWithdrawals || 0,
        ongoingProjects: ongoingProjects || 0 // Added for ongoing projects
      });
      
      setAdminLogs(logsData || []);
      
      console.log("Admin dashboard data fetched successfully:", {
        userCount,
        totalInvestments,
        totalProjects,
        pendingWithdrawals,
        ongoingProjects,
        logs: logsData?.length || 0
      });
      
      setRealTimeStatus('connected');
      
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      toast.error("Erreur lors du chargement du tableau de bord", {
        description: "Veuillez réessayer plus tard ou contacter le support."
      });
      setRealTimeStatus('error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time subscriptions for dashboard data
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
        fetchDashboardData();
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
        fetchDashboardData();
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
        fetchDashboardData();
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
        fetchDashboardData();
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
        fetchDashboardData();
      })
      .subscribe();
    
    return () => {
      console.log('Cleaning up admin dashboard real-time subscriptions');
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(investmentsChannel);
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(withdrawalsChannel);
      supabase.removeChannel(logsChannel);
    };
  }, [fetchDashboardData]);

  return {
    stats,
    adminLogs,
    isLoading,
    isRefreshing,
    realTimeStatus,
    refreshData: fetchDashboardData
  };
}
