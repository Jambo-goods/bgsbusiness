
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdmin } from '@/contexts/AdminContext';

export const useFinanceDashboard = () => {
  // State
  const [activeTab, setActiveTab] = useState('profiles');
  const { adminUser } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [realTimeStatus, setRealTimeStatus] = useState<'connected' | 'connecting' | 'error'>('connected');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddFundsDialogOpen, setIsAddFundsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Data states
  const [profiles, setProfiles] = useState([]);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [transactions, setTransactions] = useState([]);
  
  // Stats state
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalBalance: 0,
    pendingWithdrawalsAmount: 0,
    transactionCount: 0
  });

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscriptions
    const profilesChannel = supabase
      .channel('finance_profiles_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        console.log('Profiles changed, refreshing...');
        fetchDashboardData();
      })
      .subscribe();

    const transactionsChannel = supabase
      .channel('finance_transactions_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wallet_transactions'
      }, () => {
        console.log('Transactions changed, refreshing...');
        fetchDashboardData();
      })
      .subscribe();

    const withdrawalsChannel = supabase
      .channel('finance_withdrawals_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawal_requests'
      }, () => {
        console.log('Withdrawal requests changed, refreshing...');
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(withdrawalsChannel);
    };
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setIsRefreshing(true);
      
      // Fetch all profiles
      const { data: profilesData, error: profilesError, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;
      
      setProfiles(profilesData || []);
      setTotalProfiles(count || 0);
      
      // Fetch withdrawal requests
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false });
        
      if (withdrawalsError) throw withdrawalsError;
      
      setWithdrawalRequests(withdrawalsData || []);
      const pendingRequests = withdrawalsData?.filter(w => w.status === 'pending') || [];
      setPendingWithdrawals(pendingRequests.length);
      
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (transactionsError) throw transactionsError;
      
      setTransactions(transactionsData || []);
      
      // Calculate statistics
      const deposits = transactionsData?.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0) || 0;
      const withdrawals = transactionsData?.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0) || 0;
      const pendingAmount = pendingRequests.reduce((sum, w) => sum + w.amount, 0);
      const totalBalance = profilesData?.reduce((sum, p) => sum + (p.wallet_balance || 0), 0) || 0;
      
      setStats({
        totalDeposits: deposits,
        totalWithdrawals: withdrawals,
        totalBalance: totalBalance,
        pendingWithdrawalsAmount: pendingAmount,
        transactionCount: transactionsData?.length || 0
      });
      
      setRealTimeStatus('connected');
      toast.success('Données financières chargées avec succès');
      
    } catch (error) {
      console.error("Erreur lors du chargement des données financières:", error);
      toast.error("Erreur lors du chargement des données financières");
      setRealTimeStatus('error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle adding funds to all users
  const handleAddFundsToAll = async (amount: number) => {
    try {
      setIsProcessing(true);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Le montant doit être un nombre positif');
      }
      
      // Add funds to all profiles
      const promises = profiles.map(async (profile) => {
        // Update wallet balance directly
        const { error } = await supabase.rpc('increment_wallet_balance', {
          user_id: profile.id,
          increment_amount: amount
        });
        
        if (error) {
          console.error(`Erreur lors de l'ajout de fonds au profil ${profile.id}:`, error);
          return false;
        }
        
        // Create wallet transaction record
        await supabase.from('wallet_transactions').insert({
          user_id: profile.id,
          amount: amount,
          type: 'deposit',
          status: 'completed',
          description: 'Ajout de fonds par administrateur (opération groupée)'
        });
        
        return true;
      });
      
      const results = await Promise.all(promises);
      const successCount = results.filter(result => result).length;
      
      // Log admin action
      await supabase.from('admin_logs').insert({
        description: `Ajout de ${amount}€ à tous les profils (${successCount}/${profiles.length} réussis)`,
        action_type: 'wallet_management',
        admin_id: adminUser?.id,
        amount: amount
      });
      
      toast.success(`${successCount} profils mis à jour avec succès!`);
      setIsAddFundsDialogOpen(false);
      
      // Refresh data to show updated balances
      fetchDashboardData();
      
    } catch (error) {
      console.error("Erreur lors de l'ajout des fonds:", error);
      toast.error(error.message || "Erreur lors de l'ajout des fonds");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle approving withdrawal
  const handleApproveWithdrawal = async (withdrawal) => {
    if (!adminUser || !window.confirm(`Êtes-vous sûr de vouloir approuver ce retrait de ${withdrawal.amount}€ ?`)) {
      return;
    }
    
    try {
      // Check if user has sufficient balance
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', withdrawal.user_id)
        .single();
        
      if (userError) throw userError;
      
      if (userData.wallet_balance < withdrawal.amount) {
        toast.error("L'utilisateur n'a pas assez de fonds pour ce retrait");
        return;
      }
      
      // Update withdrawal status
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'approved',
          admin_id: adminUser.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawal.id);
        
      if (withdrawalError) throw withdrawalError;
      
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: withdrawal.user_id,
          amount: withdrawal.amount,
          type: 'withdrawal',
          description: 'Retrait approuvé'
        });
        
      if (transactionError) throw transactionError;
      
      // Update user wallet balance
      const { error: walletError } = await supabase.rpc(
        'increment_wallet_balance',
        { user_id: withdrawal.user_id, increment_amount: -withdrawal.amount }
      );
      
      if (walletError) throw walletError;
      
      // Log admin action
      await supabase.from('admin_logs').insert({
        description: `Approbation d'un retrait de ${withdrawal.amount}€`,
        action_type: 'withdrawal_management',
        admin_id: adminUser.id,
        target_user_id: withdrawal.user_id,
        amount: withdrawal.amount
      });
      
      toast.success(`Retrait de ${withdrawal.amount}€ approuvé`);
      
      // Refresh data
      fetchDashboardData();
      
    } catch (error) {
      console.error("Erreur lors de l'approbation du retrait:", error);
      toast.error("Une erreur s'est produite lors de l'approbation du retrait");
    }
  };

  // Handle rejecting withdrawal
  const handleRejectWithdrawal = async (withdrawal) => {
    if (!adminUser || !window.confirm(`Êtes-vous sûr de vouloir rejeter ce retrait de ${withdrawal.amount}€ ?`)) {
      return;
    }
    
    try {
      // Update withdrawal status
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          admin_id: adminUser.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawal.id);
        
      if (withdrawalError) throw withdrawalError;
      
      // Log admin action
      await supabase.from('admin_logs').insert({
        description: `Rejet d'un retrait de ${withdrawal.amount}€`,
        action_type: 'withdrawal_management',
        admin_id: adminUser.id,
        target_user_id: withdrawal.user_id,
        amount: withdrawal.amount
      });
      
      toast.success(`Retrait de ${withdrawal.amount}€ rejeté`);
      
      // Refresh data
      fetchDashboardData();
      
    } catch (error) {
      console.error("Erreur lors du rejet du retrait:", error);
      toast.error("Une erreur s'est produite lors du rejet du retrait");
    }
  };

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter((profile) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (profile.first_name && profile.first_name.toLowerCase().includes(searchLower)) ||
      (profile.last_name && profile.last_name.toLowerCase().includes(searchLower)) ||
      (profile.email && profile.email.toLowerCase().includes(searchLower))
    );
  });

  // Filter withdrawals based on search term
  const filteredWithdrawals = withdrawalRequests.filter((withdrawal) => {
    const profile = profiles.find(p => p.id === withdrawal.user_id) || {};
    
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase();
    const userEmail = (profile.email || '').toLowerCase();
    
    return userName.includes(searchLower) || userEmail.includes(searchLower);
  });

  return {
    // State
    activeTab,
    setActiveTab,
    isLoading,
    realTimeStatus,
    searchTerm,
    setSearchTerm,
    isRefreshing,
    isAddFundsDialogOpen,
    setIsAddFundsDialogOpen,
    isProcessing,
    
    // Data
    profiles,
    totalProfiles,
    withdrawalRequests,
    pendingWithdrawals,
    transactions,
    stats,
    filteredProfiles,
    filteredWithdrawals,
    
    // Functions
    fetchDashboardData,
    handleAddFundsToAll,
    handleApproveWithdrawal,
    handleRejectWithdrawal
  };
};
