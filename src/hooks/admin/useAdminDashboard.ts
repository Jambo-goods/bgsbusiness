
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AdminDashboardStats = {
  userCount: number;
  totalInvestments: number;
  totalProjects: number;
  pendingWithdrawals: number;
};

export default function useAdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats>({
    userCount: 0,
    totalInvestments: 0,
    totalProjects: 0,
    pendingWithdrawals: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [realTimeStatus, setRealTimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (userError) throw userError;
      
      // Fetch total investment amount
      const { data: investmentData, error: investmentError } = await supabase
        .from('investments')
        .select('amount')
        .eq('status', 'active');
        
      if (investmentError) throw investmentError;
      
      const totalInvestments = investmentData.reduce((sum, item) => sum + item.amount, 0);
      
      // Fetch project count
      const { count: projectCount, error: projectError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });
        
      if (projectError) throw projectError;
      
      // Fetch pending withdrawals
      const { count: pendingWithdrawals, error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
        
      if (withdrawalError) throw withdrawalError;
      
      setStats({
        userCount: userCount || 0,
        totalInvestments: totalInvestments,
        totalProjects: projectCount || 0,
        pendingWithdrawals: pendingWithdrawals || 0
      });
      
      console.log("Dashboard stats updated:", {
        userCount,
        totalInvestments,
        projectCount,
        pendingWithdrawals
      });
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error("Erreur de chargement", {
        description: "Impossible de récupérer les statistiques du tableau de bord."
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const fetchRecentAdminLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select(`
          id,
          action_type,
          description,
          created_at,
          admin_id,
          admin_users(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      setAdminLogs(data || []);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
    }
  };
  
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardStats();
    fetchRecentAdminLogs();
    toast.info("Actualisation en cours", {
      description: "Les données du tableau de bord sont en cours d'actualisation."
    });
  };

  useEffect(() => {
    // Fetch initial dashboard stats
    fetchDashboardStats();
    fetchRecentAdminLogs();
    
    // Set up real-time subscriptions for changes in relevant tables
    console.log("Setting up real-time subscriptions for admin dashboard...");
    
    // Subscription for profiles (user count)
    const profilesChannel = supabase
      .channel('admin_profiles_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        console.log('Profiles data changed, refreshing stats...', payload);
        fetchDashboardStats();
        if (payload.eventType === 'INSERT') {
          toast.success("Nouvel utilisateur", {
            description: "Un nouvel utilisateur vient de s'inscrire."
          });
        } else {
          toast.info("Mise à jour détectée", {
            description: "Les données utilisateurs ont été mises à jour."
          });
        }
      })
      .subscribe((status) => {
        console.log('Profiles subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setRealTimeStatus('connected');
          console.log('Successfully subscribed to profiles table');
        } else if (status === 'CHANNEL_ERROR') {
          setRealTimeStatus('error');
          console.error('Error subscribing to profiles changes');
        }
      });
      
    // Subscription for investments
    const investmentsChannel = supabase
      .channel('admin_investments_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments'
      }, () => {
        console.log('Investments data changed, refreshing stats...');
        fetchDashboardStats();
        toast.info("Mise à jour détectée", {
          description: "Les données d'investissements ont été mises à jour."
        });
      })
      .subscribe();
      
    // Subscription for projects
    const projectsChannel = supabase
      .channel('admin_projects_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects'
      }, () => {
        console.log('Projects data changed, refreshing stats...');
        fetchDashboardStats();
        toast.info("Mise à jour détectée", {
          description: "Les données des projets ont été mises à jour."
        });
      })
      .subscribe();
      
    // Subscription for withdrawal requests
    const withdrawalsChannel = supabase
      .channel('admin_withdrawals_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawal_requests'
      }, () => {
        console.log('Withdrawal requests changed, refreshing stats...');
        fetchDashboardStats();
        toast.info("Mise à jour détectée", {
          description: "Des demandes de retrait ont été mises à jour."
        });
      })
      .subscribe();
      
    // Subscription for admin logs
    const logsChannel = supabase
      .channel('admin_logs_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'admin_logs'
      }, () => {
        console.log('Admin logs changed, refreshing recent actions...');
        fetchRecentAdminLogs();
      })
      .subscribe();
    
    // Clean up subscriptions on component unmount
    return () => {
      console.log("Cleaning up real-time subscriptions");
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(investmentsChannel);
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(withdrawalsChannel);
      supabase.removeChannel(logsChannel);
    };
  }, []);

  return {
    stats,
    isLoading,
    isRefreshing,
    adminLogs,
    realTimeStatus,
    handleManualRefresh
  };
}
