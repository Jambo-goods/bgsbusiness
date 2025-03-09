
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { logAdminAction } from '@/services/adminAuthService';
import { FinancialOverviewCard } from '@/components/admin/finance/FinancialOverviewCard';
import { FinancialMetricCard } from '@/components/admin/finance/FinancialMetricCard';
import { FinancialChart } from '@/components/admin/finance/FinancialChart';
import { UsersTable } from '@/components/admin/finance/UsersTable';
import { UserDetailsPanel } from '@/components/admin/finance/UserDetailsPanel';
import { TransactionFilters } from '@/components/admin/finance/TransactionFilters';
import SearchBar from '@/components/admin/users/SearchBar';
import { 
  Loader2, 
  Users as UsersIcon, 
  ArrowLeftRight,
  CreditCard,
  LineChart 
} from 'lucide-react';
import { toast } from 'sonner';

export default function FinanceManagement() {
  const { adminUser } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [financialData, setFinancialData] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalBalance: 0,
    averageYield: 0,
  });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [transactionType, setTransactionType] = useState('all');

  useEffect(() => {
    fetchFinancialData();
    fetchUsers();
  }, []);

  // Filter users when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = users.filter(user => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      const id = user.id.toLowerCase();
      
      return fullName.includes(searchTermLower) || 
             email.includes(searchTermLower) || 
             id.includes(searchTermLower);
    });
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      
      // Get user count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (userError) throw userError;
      
      // Get total deposits
      const { data: depositsData, error: depositsError } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .eq('type', 'deposit')
        .eq('status', 'completed');
      
      if (depositsError) throw depositsError;
      
      const totalDeposits = depositsData?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      
      // Get total withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .eq('type', 'withdrawal')
        .eq('status', 'completed');
      
      if (withdrawalsError) throw withdrawalsError;
      
      const totalWithdrawals = withdrawalsData?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      
      // Get total wallet balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('profiles')
        .select('wallet_balance');
      
      if (balanceError) throw balanceError;
      
      const totalBalance = balanceData?.reduce((sum, profile) => sum + (profile.wallet_balance || 0), 0) || 0;
      
      // Get average yield from investments
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('investments')
        .select('yield_rate');
      
      if (investmentsError) throw investmentsError;
      
      const averageYield = investmentsData && investmentsData.length > 0
        ? investmentsData.reduce((sum, inv) => sum + inv.yield_rate, 0) / investmentsData.length
        : 0;
      
      setFinancialData({
        totalUsers: userCount || 0,
        totalDeposits,
        totalWithdrawals,
        totalBalance,
        averageYield,
      });
      
      if (adminUser) {
        await logAdminAction(
          adminUser.id,
          'wallet_management',
          'Consulté le tableau de bord financier'
        );
      }
      
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error("Erreur lors du chargement des données financières");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          investments:investments(id, amount, yield_rate, status, project_id, duration)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setUsers(data || []);
      setFilteredUsers(data || []);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Erreur lors du chargement des utilisateurs");
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleCloseUserDetails = () => {
    setSelectedUser(null);
  };

  const handleAddFunds = async (userId, amount, description) => {
    if (!adminUser) {
      toast.error("Vous devez être connecté pour effectuer cette action");
      return;
    }

    try {
      // Create wallet transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'deposit',
          description: description || 'Dépôt administratif'
        });
        
      if (transactionError) throw transactionError;
      
      // Update user wallet balance
      const { error: walletError } = await supabase.rpc(
        'increment_wallet_balance',
        { user_id: userId, increment_amount: amount }
      );
      
      if (walletError) throw walletError;
      
      // Log admin action
      await logAdminAction(
        adminUser.id,
        'wallet_management',
        `Ajout de ${amount}€ au compte utilisateur`,
        userId,
        undefined,
        amount
      );
      
      toast.success(`${amount}€ ajoutés avec succès`);
      
      // Refresh users and financial data
      fetchUsers();
      fetchFinancialData();
      
      // If the selected user was modified, refresh selected user data
      if (selectedUser && selectedUser.id === userId) {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            investments:investments(id, amount, yield_rate, status, project_id, duration)
          `)
          .eq('id', userId)
          .single();
          
        if (!error && data) {
          setSelectedUser(data);
        }
      }
      
    } catch (error) {
      console.error("Erreur lors de l'ajout de fonds:", error);
      toast.error("Une erreur s'est produite lors de l'ajout de fonds");
    }
  };

  const handleProcessWithdrawal = async (userId, amount, description) => {
    if (!adminUser) {
      toast.error("Vous devez être connecté pour effectuer cette action");
      return;
    }

    try {
      // First check if user has enough balance
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();
        
      if (userError) throw userError;
      
      if (userData.wallet_balance < amount) {
        toast.error("L'utilisateur n'a pas assez de fonds pour ce retrait");
        return;
      }
      
      // Create wallet transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'withdrawal',
          description: description || 'Retrait administratif'
        });
        
      if (transactionError) throw transactionError;
      
      // Update user wallet balance
      const { error: walletError } = await supabase.rpc(
        'increment_wallet_balance',
        { user_id: userId, increment_amount: -amount }
      );
      
      if (walletError) throw walletError;
      
      // Log admin action
      await logAdminAction(
        adminUser.id,
        'wallet_management',
        `Retrait de ${amount}€ du compte utilisateur`,
        userId,
        undefined,
        amount
      );
      
      toast.success(`${amount}€ retirés avec succès`);
      
      // Refresh users and financial data
      fetchUsers();
      fetchFinancialData();
      
      // If the selected user was modified, refresh selected user data
      if (selectedUser && selectedUser.id === userId) {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            investments:investments(id, amount, yield_rate, status, project_id, duration)
          `)
          .eq('id', userId)
          .single();
          
        if (!error && data) {
          setSelectedUser(data);
        }
      }
      
    } catch (error) {
      console.error("Erreur lors du retrait de fonds:", error);
      toast.error("Une erreur s'est produite lors du retrait de fonds");
    }
  };

  return (
    <div className="p-6">
      <Helmet>
        <title>Administration | Gestion Financière</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-bgs-blue">Tableau de Bord Financier</h1>
        <button 
          onClick={() => {
            fetchFinancialData();
            fetchUsers();
          }}
          className="px-4 py-2 bg-bgs-blue text-white rounded-lg hover:bg-bgs-blue-light transition-colors flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Actualiser
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-bgs-blue" />
        </div>
      ) : (
        <>
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <FinancialMetricCard 
              title="Utilisateurs" 
              value={financialData.totalUsers}
              icon={<UsersIcon className="w-5 h-5 text-bgs-blue" />}
              format="number"
            />
            <FinancialMetricCard 
              title="Dépôts Totaux" 
              value={financialData.totalDeposits}
              icon={<CreditCard className="w-5 h-5 text-green-600" />}
              format="currency"
            />
            <FinancialMetricCard 
              title="Retraits Totaux" 
              value={financialData.totalWithdrawals}
              icon={<ArrowLeftRight className="w-5 h-5 text-orange-600" />}
              format="currency"
            />
            <FinancialMetricCard 
              title="Solde Total" 
              value={financialData.totalBalance}
              icon={<CreditCard className="w-5 h-5 text-blue-600" />}
              format="currency"
            />
            <FinancialMetricCard 
              title="Rentabilité Moyenne" 
              value={financialData.averageYield}
              icon={<LineChart className="w-5 h-5 text-purple-600" />}
              format="percentage"
            />
          </div>
          
          {/* Financial Charts */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Tendances Financières</h2>
            <FinancialChart />
          </div>
          
          {/* User Management Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-lg font-semibold">Comptes Utilisateurs</h2>
              <SearchBar 
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Rechercher par nom, email, ID..."
              />
            </div>
            
            <TransactionFilters 
              dateRange={dateRange}
              setDateRange={setDateRange}
              transactionType={transactionType}
              setTransactionType={setTransactionType}
            />
            
            {selectedUser ? (
              <UserDetailsPanel 
                user={selectedUser}
                onClose={handleCloseUserDetails}
                onAddFunds={handleAddFunds}
                onWithdrawFunds={handleProcessWithdrawal}
              />
            ) : (
              <UsersTable 
                users={filteredUsers}
                onSelectUser={handleSelectUser}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
