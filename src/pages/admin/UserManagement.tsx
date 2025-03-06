
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { logAdminAction } from '@/services/adminAuthService';
import { 
  Search, Plus, ArrowUp, ArrowDown, Euro,
  Loader2, MoreHorizontal, Pencil, Wallet, UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

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

  useEffect(() => {
    fetchUsers();
    
    // Set up real-time subscription for profiles
    const profilesChannel = supabase
      .channel('admin_profiles_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        console.log('Profiles data changed, refreshing users...');
        fetchUsers();
        toast.info("Mise à jour détectée", {
          description: "Les données utilisateurs ont été mises à jour."
        });
      })
      .subscribe();
      
    // Clean up subscription on component unmount
    return () => {
      supabase.removeChannel(profilesChannel);
    };
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
      setUsers(data || []);
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un utilisateur..."
            className="pl-10 w-full md:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
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
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-bgs-blue" />
          </div>
        ) : hasError ? (
          <div className="text-center p-8 text-red-500">
            Une erreur est survenue lors du chargement des utilisateurs. 
            <Button 
              variant="link" 
              onClick={fetchUsers} 
              className="text-bgs-blue"
            >
              Réessayer
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            Aucun utilisateur trouvé dans la base de données
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            Aucun utilisateur ne correspond à votre recherche
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <button 
                      className="flex items-center space-x-1 hover:text-bgs-blue"
                      onClick={() => handleSort('first_name')}
                    >
                      <span>Nom</span>
                      {sortField === 'first_name' && (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center space-x-1 hover:text-bgs-blue"
                      onClick={() => handleSort('wallet_balance')}
                    >
                      <span>Solde</span>
                      {sortField === 'wallet_balance' && (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center space-x-1 hover:text-bgs-blue"
                      onClick={() => handleSort('investment_total')}
                    >
                      <span>Investissements</span>
                      {sortField === 'investment_total' && (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center space-x-1 hover:text-bgs-blue"
                      onClick={() => handleSort('created_at')}
                    >
                      <span>Date d'inscription</span>
                      {sortField === 'created_at' && (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.wallet_balance?.toLocaleString() || 0} €</TableCell>
                    <TableCell>{user.investment_total?.toLocaleString() || 0} €</TableCell>
                    <TableCell>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsAddFundsModalOpen(true);
                          }}
                          title="Ajouter des fonds"
                        >
                          <Wallet className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // View user details
                            console.log("View user details:", user);
                          }}
                          title="Voir les détails"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {/* Add Funds Modal */}
      {isAddFundsModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-bgs-blue mb-4">
              Ajouter des fonds
            </h2>
            <p className="text-gray-600 mb-4">
              Vous ajoutez des fonds au compte de <strong>{selectedUser.first_name} {selectedUser.last_name}</strong>
            </p>
            
            <form onSubmit={handleAddFunds}>
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (€)
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="1"
                    className="pl-10"
                    placeholder="Montant"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddFundsModalOpen(false);
                    setFundAmount('');
                  }}
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
      
      {/* Create User Modal */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-bgs-blue mb-4">
              Créer un utilisateur test
            </h2>
            <p className="text-gray-600 mb-4">
              Cet utilisateur sera créé uniquement pour les tests et n'aura pas d'accès au compte.
            </p>
            
            <form onSubmit={handleCreateTestUser}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="wallet_balance">Solde initial (€)</Label>
                  <Input
                    id="wallet_balance"
                    type="number"
                    min="0"
                    step="1"
                    value={newUser.wallet_balance}
                    onChange={(e) => setNewUser({...newUser, wallet_balance: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateUserModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Créer l'utilisateur
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
