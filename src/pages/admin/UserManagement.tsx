
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { logAdminAction } from '@/services/adminAuthService';
import { Loader2, RefreshCw, Wallet, Search, UserPlus, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserManagement() {
  const { adminUser } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);

  // Fetch all users from Supabase
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsRefreshing(true);
      
      console.log("Fetching users with sort:", sortField, sortDirection);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
      
      if (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        setError("Impossible de charger les utilisateurs");
        throw error;
      }
      
      console.log("Utilisateurs récupérés:", data);
      
      if (data) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError("Une erreur est survenue lors du chargement des utilisateurs");
      toast.error("Erreur de chargement", {
        description: "Impossible de récupérer les utilisateurs"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch and setup real-time subscription
  useEffect(() => {
    fetchUsers();
    
    // Set up real-time subscription for profiles table
    const profilesChannel = supabase
      .channel('admin_profiles_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        console.log('Profiles data changed:', payload);
        fetchUsers();
        toast.info("Mise à jour détectée", {
          description: "Les données utilisateurs ont été mises à jour."
        });
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  // Re-fetch when sort criteria changes
  useEffect(() => {
    if (!isLoading) {
      fetchUsers();
    }
  }, [sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchUsers();
    toast.info("Actualisation des données en cours...");
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  // Handle adding funds
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
      setShowAddFundsModal(false);
      setFundAmount('');
      
      // Refresh user list
      fetchUsers();
      
    } catch (error) {
      console.error("Erreur lors de l'ajout de fonds:", error);
      toast.error("Une erreur s'est produite lors de l'ajout de fonds");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-bgs-blue">Gestion des utilisateurs</h1>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="ml-2 text-sm text-gray-500">
            {filteredUsers.length} compte{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            {error}
            <Button variant="link" onClick={fetchUsers} className="ml-2">
              Réessayer
            </Button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Aucun compte utilisateur trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <button 
                      className="flex items-center font-semibold"
                      onClick={() => handleSort('first_name')}
                    >
                      Nom
                      {sortField === 'first_name' && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center font-semibold"
                      onClick={() => handleSort('wallet_balance')}
                    >
                      Solde du compte
                      {sortField === 'wallet_balance' && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center font-semibold"
                      onClick={() => handleSort('investment_total')}
                    >
                      Total investi
                      {sortField === 'investment_total' && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center font-semibold"
                      onClick={() => handleSort('created_at')}
                    >
                      Date d'inscription
                      {sortField === 'created_at' && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name || 'Sans nom'} {user.last_name || ''}
                    </TableCell>
                    <TableCell>{user.email || 'Email non disponible'}</TableCell>
                    <TableCell>{user.wallet_balance?.toLocaleString() || 0} €</TableCell>
                    <TableCell>{user.investment_total?.toLocaleString() || 0} €</TableCell>
                    <TableCell>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowAddFundsModal(true);
                        }}
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        Ajouter des fonds
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add Funds Modal */}
      {showAddFundsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-bgs-blue mb-4">
              Ajouter des fonds
            </h2>
            <p className="text-gray-600 mb-4">
              Vous ajoutez des fonds au compte de <strong>{selectedUser.first_name || 'Utilisateur'} {selectedUser.last_name || ''}</strong>
            </p>
            
            <form onSubmit={handleAddFunds}>
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (€)
                </label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Montant"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddFundsModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-bgs-blue hover:bg-bgs-blue-light text-white"
                >
                  Confirmer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
