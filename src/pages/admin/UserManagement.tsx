
import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCw, Search, Plus, ArrowUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AddFundsDialog from "@/components/admin/profiles/AddFundsDialog";

export default function UserManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch users data from Supabase
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setUsers(data || []);
      applyFilters(data || [], searchTerm);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);
  
  // Apply filters to the users list
  const applyFilters = (usersData: any[], search: string) => {
    let filtered = [...usersData];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user => 
        (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const fieldA = a[sortField] || '';
      const fieldB = b[sortField] || '';
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB) 
          : fieldB.localeCompare(fieldA);
      } else {
        return sortDirection === 'asc' 
          ? fieldA - fieldB 
          : fieldB - fieldA;
      }
    });
    
    setFilteredUsers(filtered);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(users, value);
  };
  
  // Handle sorting
  const handleSort = (field: string) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    // Re-apply filters with new sorting
    applyFilters(users, searchTerm);
  };
  
  // Handle refreshing the data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    setIsRefreshing(false);
    toast.success("Données actualisées");
  };
  
  // Open add funds dialog
  const handleAddFunds = (user: any) => {
    setSelectedUser(user);
    setShowAddFundsDialog(true);
  };
  
  // Close add funds dialog
  const handleCloseAddFundsDialog = () => {
    setShowAddFundsDialog(false);
    setSelectedUser(null);
  };
  
  // Handle funds added successfully
  const handleFundsAdded = () => {
    fetchUsers();
    setShowAddFundsDialog(false);
    setSelectedUser(null);
  };
  
  // Toggle user active status
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active: !currentStatus } : user
      ));
      setFilteredUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active: !currentStatus } : user
      ));
      
      toast.success(`Utilisateur ${!currentStatus ? 'activé' : 'désactivé'}`);
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Erreur lors de la modification du statut");
    }
  };
  
  // Set up polling
  useEffect(() => {
    fetchUsers();
    
    // Set up polling every 30 seconds
    const pollingInterval = setInterval(() => {
      fetchUsers();
    }, 30000);
    
    return () => {
      clearInterval(pollingInterval);
    };
  }, [fetchUsers]);
  
  return (
    <>
      <Helmet>
        <title>Gestion des utilisateurs | BGS Invest</title>
      </Helmet>
      
      <AdminLayout>
        <div className="px-4 py-8 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Gestion des utilisateurs</h1>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Rechercher un utilisateur..."
                  className="pl-8 w-full md:w-64"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucun utilisateur trouvé
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('last_name')}>
                        Nom
                        <ArrowUpDown className="h-4 w-4 inline-block ml-1" />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>
                        Email
                        <ArrowUpDown className="h-4 w-4 inline-block ml-1" />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('wallet_balance')}>
                        Solde
                        <ArrowUpDown className="h-4 w-4 inline-block ml-1" />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
                        Inscription
                        <ArrowUpDown className="h-4 w-4 inline-block ml-1" />
                      </TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.wallet_balance || 0} €</TableCell>
                        <TableCell>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={user.is_active !== false} 
                              onCheckedChange={() => toggleUserStatus(user.id, user.is_active !== false)}
                            />
                            <Label>{user.is_active !== false ? 'Actif' : 'Inactif'}</Label>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleAddFunds(user)}
                            >
                              Gérer les fonds
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
        </div>
        
        {showAddFundsDialog && selectedUser && (
          <AddFundsDialog
            user={selectedUser}
            onClose={handleCloseAddFundsDialog}
            onSuccess={handleFundsAdded}
          />
        )}
      </AdminLayout>
    </>
  );
}
