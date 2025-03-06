import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { CreditCard, Users, Database, TrendingUp, ArrowLeftRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { adminUser } = useAdmin();
  const [stats, setStats] = useState({
    userCount: 0,
    totalInvestments: 0,
    totalProjects: 0,
    pendingWithdrawals: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [realTimeStatus, setRealTimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

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

  // Last login info
  const lastLogin = adminUser?.last_login 
    ? new Date(adminUser.last_login).toLocaleString('fr-FR')
    : 'Première connexion';

  // Format date for admin logs
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format action type for display
  const formatActionType = (type: string) => {
    const typeMap: Record<string, string> = {
      'login': 'Connexion',
      'user_management': 'Gestion utilisateur',
      'project_management': 'Gestion projet',
      'wallet_management': 'Gestion portefeuille',
      'withdrawal_management': 'Gestion retrait'
    };
    
    return typeMap[type] || type;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-bgs-blue">Tableau de bord administrateur</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full mr-2 animate-pulse ${
              realTimeStatus === 'connected' ? 'bg-green-500' : 
              realTimeStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm text-gray-600 mr-3">
              {realTimeStatus === 'connected' ? 'Temps réel actif' : 
              realTimeStatus === 'error' ? 'Erreur de connexion' : 'Connexion...'}
            </span>
          </div>
          <button 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-bgs-blue text-white rounded-lg hover:bg-bgs-blue-dark transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <p className="text-gray-500">
          Bienvenue, <span className="font-medium text-bgs-blue">{adminUser?.first_name} {adminUser?.last_name}</span>.
          Dernière connexion: {lastLogin}
        </p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-bgs-blue" />
              </div>
              <h3 className="text-lg text-gray-700">Utilisateurs</h3>
            </div>
            <p className="text-3xl font-bold text-bgs-blue">{stats.userCount}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg text-gray-700">Investissements</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.totalInvestments.toLocaleString()} €</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg text-gray-700">Projets</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.totalProjects}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <ArrowLeftRight className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg text-gray-700">Retraits en attente</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.pendingWithdrawals}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-bgs-blue mb-4">Dernières actions</h2>
          {adminLogs.length > 0 ? (
            <div className="divide-y">
              {adminLogs.map((log) => (
                <div key={log.id} className="py-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-bgs-blue">
                      {log.admin_users?.first_name} {log.admin_users?.last_name}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(log.created_at)}</span>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
                      {formatActionType(log.action_type)}
                    </span>
                    {log.description}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune action récente</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-bgs-blue mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              <Users className="h-8 w-8 mx-auto mb-2 text-bgs-blue" />
              <span className="font-medium text-bgs-blue">Gérer les utilisateurs</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/admin/projects'}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              <Database className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <span className="font-medium text-bgs-blue">Gérer les projets</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/admin/wallets'}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <span className="font-medium text-bgs-blue">Gérer les portefeuilles</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/admin/withdrawals'}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <span className="font-medium text-bgs-blue">Gérer les retraits</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
