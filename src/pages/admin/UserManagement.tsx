
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { logAdminAction } from '@/services/adminAuthService';
import { useAdminRealTimeSubscriptions } from '@/hooks/useAdminRealTimeSubscriptions';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

// Import refactored components
import UserSearchBar from '@/components/admin/users/UserSearchBar';
import UserTable from '@/components/admin/users/UserTable';
import AddFundsModal from '@/components/admin/users/AddFundsModal';
import CreateUserModal from '@/components/admin/users/CreateUserModal';
import RealtimeStatus from '@/components/admin/users/RealtimeStatus';

export default function UserManagement() {
  const { adminUser } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [hasError, setHasError] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    wallet_balance: '0'
  });

  // Set up real-time subscriptions
  const { realTimeStatus } = useAdminRealTimeSubscriptions({
    onProfileUpdate: () => {
      console.log("Real-time update detected, refreshing users list");
      fetchUsers();
    }
  });

  // Effect hook for initial user data fetch
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Separate effect for sorting changes to avoid duplicate fetching
  useEffect(() => {
    if (!isLoading) {
      console.log('Sort criteria changed, refreshing data');
      fetchUsers();
    }
  }, [sortField, sortDirection]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      console.log("Fetching users with sort field:", sortField, "direction:", sortDirection);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
        
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log("Fetched users:", data);
      
      if (data) {
        setUsers(data);
        
        if (data.length === 0) {
          console.log("No users found in the profiles table");
          toast.info("Base de données vide", {
            description: "Aucun utilisateur trouvé dans la base de données. Vous pouvez créer un utilisateur test."
          });
        }
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setHasError(true);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setIsLoading(false);
    }
  };

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
          id: crypto.randomUUID(),
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

  const handleSort = (field: string) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to desc
      setSortField(field);
      setSortDirection('desc');
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

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-bgs-blue mb-6">Gestion des Utilisateurs</h1>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <UserSearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />
        
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateUserModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Créer utilisateur test
          </Button>
          
          <Button
            onClick={() => fetchUsers()}
            className="bg-bgs-blue hover:bg-bgs-blue-light text-white"
          >
            Actualiser
          </Button>
        </div>
      </div>
      
      {/* Realtime status indicator */}
      <RealtimeStatus status={realTimeStatus} />
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <UserTable 
          users={users}
          filteredUsers={filteredUsers}
          isLoading={isLoading}
          hasError={hasError}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          fetchUsers={fetchUsers}
          onAddFunds={(user) => {
            setSelectedUser(user);
            setIsAddFundsModalOpen(true);
          }}
          onCreateUser={() => setIsCreateUserModalOpen(true)}
          searchTerm={searchTerm}
        />
      </div>
      
      {/* Add Funds Modal */}
      <AddFundsModal 
        isOpen={isAddFundsModalOpen}
        selectedUser={selectedUser}
        onClose={() => {
          setIsAddFundsModalOpen(false);
          setFundAmount('');
        }}
        onAddFunds={handleAddFunds}
        fundAmount={fundAmount}
        setFundAmount={setFundAmount}
      />
      
      {/* Create User Modal */}
      <CreateUserModal 
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onCreateUser={handleCreateTestUser}
        newUser={newUser}
        setNewUser={setNewUser}
      />
    </div>
  );
}
