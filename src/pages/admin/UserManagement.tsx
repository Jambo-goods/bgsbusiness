
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { logAdminAction } from '@/services/adminAuthService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserManagement } from '@/hooks/admin/useUserManagement';

// Import refactored components
import UserSearchBar from '@/components/admin/users/UserSearchBar';
import RealtimeStatus from '@/components/admin/users/RealtimeStatus';
import UsersTable from '@/components/admin/users/UsersTable';
import EmptyUserState from '@/components/admin/users/EmptyUserState';
import AddFundsModal from '@/components/admin/users/AddFundsModal';
import CreateUserModal from '@/components/admin/users/CreateUserModal';

export default function UserManagement() {
  const { adminUser } = useAdmin();
  const {
    filteredUsers,
    isLoading,
    hasError,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    handleSort,
    fetchUsers,
    realTimeStatus,
    isRefreshing
  } = useUserManagement();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    wallet_balance: '0'
  });

  const handleCreateTestUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminUser) return;
    
    try {
      // Validate input
      if (!newUser.first_name || !newUser.last_name || !newUser.email) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      
      // Create user directly in profiles table (for testing)
      const walletBalance = parseInt(newUser.wallet_balance) || 0;
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(), // Generate a UUID for the test user
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          email: newUser.email,
          wallet_balance: walletBalance,
          investment_total: 0
        })
        .select();
        
      if (error) throw error;
      
      // Log admin action
      await logAdminAction(
        adminUser.id,
        'user_management',
        `Création d'un utilisateur test: ${newUser.first_name} ${newUser.last_name}`,
        data?.[0]?.id
      );
      
      toast.success(`Utilisateur test créé avec succès`);
      setIsCreateUserModalOpen(false);
      
      // Reset form
      setNewUser({
        first_name: '',
        last_name: '',
        email: '',
        wallet_balance: '0'
      });
      
      // Refresh users list
      fetchUsers();
      
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur test:", error);
      toast.error("Une erreur s'est produite lors de la création de l'utilisateur test");
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !adminUser) return;
    
    const amount = parseInt(fundAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error("Veuillez saisir un montant valide");
      return;
    }
    
    try {
      // Add transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: selectedUser.id,
          amount: amount,
          type: 'deposit',
          description: 'Crédit manuel par administrateur'
        });
        
      if (transactionError) throw transactionError;
      
      // Update user balance
      const { error: walletError } = await supabase.rpc(
        'increment_wallet_balance',
        { user_id: selectedUser.id, increment_amount: amount }
      );
      
      if (walletError) throw walletError;
      
      // Log admin action
      await logAdminAction(
        adminUser.id,
        'wallet_management',
        `Ajout de ${amount}€ au compte de ${selectedUser.first_name} ${selectedUser.last_name}`,
        selectedUser.id,
        undefined,
        amount
      );
      
      toast.success(`${amount}€ ont été ajoutés au compte de ${selectedUser.first_name} ${selectedUser.last_name}`);
      setIsAddFundsModalOpen(false);
      setFundAmount('');
      
      // Refresh user list
      fetchUsers();
      
    } catch (error) {
      console.error("Erreur lors de l'ajout de fonds:", error);
      toast.error("Une erreur s'est produite lors de l'ajout de fonds");
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-bgs-blue mb-6">Gestion des Utilisateurs</h1>
      
      <UserSearchBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onCreateUser={() => setIsCreateUserModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        userCount={filteredUsers.length}
      />
      
      <RealtimeStatus status={realTimeStatus} />
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-bgs-blue" />
          </div>
        ) : hasError ? (
          <div className="text-center p-8 text-red-500">
            Une erreur est survenue lors du chargement des utilisateurs. 
            <button 
              onClick={fetchUsers} 
              className="text-bgs-blue ml-2 underline"
            >
              Réessayer
            </button>
          </div>
        ) : filteredUsers.length === 0 && searchTerm === '' ? (
          <EmptyUserState onCreateUser={() => setIsCreateUserModalOpen(true)} />
        ) : (
          <UsersTable 
            users={filteredUsers} 
            sortConfig={{ field: sortField, direction: sortDirection }}
            onSort={handleSort}
            onAddFunds={(user) => {
              setSelectedUser(user);
              setIsAddFundsModalOpen(true);
            }}
          />
        )}
      </div>
      
      <AddFundsModal 
        isOpen={isAddFundsModalOpen}
        selectedUser={selectedUser}
        fundAmount={fundAmount}
        setFundAmount={setFundAmount}
        onClose={() => {
          setIsAddFundsModalOpen(false);
          setFundAmount('');
        }}
        onSubmit={handleAddFunds}
      />
      
      <CreateUserModal 
        isOpen={isCreateUserModalOpen}
        newUser={newUser}
        setNewUser={setNewUser}
        onClose={() => setIsCreateUserModalOpen(false)}
        onSubmit={handleCreateTestUser}
      />
    </div>
  );
}
