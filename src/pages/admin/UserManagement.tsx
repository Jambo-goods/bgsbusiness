
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

// Component imports
import { UserManagementHeader } from '@/components/admin/user-management/UserManagementHeader';
import { SearchBar } from '@/components/admin/user-management/SearchBar';
import { UserTable } from '@/components/admin/user-management/UserTable';
import { TableSkeleton } from '@/components/admin/user-management/TableSkeleton';
import { AddFundsModal } from '@/components/admin/user-management/AddFundsModal';

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
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('initializing');

  // Fetch all users from Supabase
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsRefreshing(true);
      
      console.log("Fetching users with sort:", sortField, sortDirection);
      
      // Explicitly log the SQL query we're about to execute
      console.log(`SELECT * FROM profiles ORDER BY ${sortField} ${sortDirection.toUpperCase()}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
      
      if (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        setError("Impossible de charger les utilisateurs");
        throw error;
      }
      
      // Detailed logging for troubleshooting
      console.log("Nombre d'utilisateurs récupérés:", data?.length);
      console.log("Utilisateurs récupérés:", data);
      
      if (data) {
        // Add additional validation to ensure data is an array
        if (Array.isArray(data)) {
          setUsers(data);
          console.log("Données utilisateurs définies avec succès:", data.length, "utilisateurs");
        } else {
          console.error("Les données reçues ne sont pas un tableau:", data);
          setUsers([]);
          setError("Format de données inattendu");
        }
      } else {
        console.log("Aucune donnée reçue");
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
    console.log("Initializing user management page");
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
      .subscribe((status) => {
        console.log("Admin profiles subscription status:", status);
        setSubscriptionStatus(status);
        
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to profiles table");
        } else if (status === 'CHANNEL_ERROR') {
          console.error("Error subscribing to profiles table");
          toast.error("Erreur d'abonnement", {
            description: "Impossible de surveiller les changements en temps réel"
          });
        }
      });
    
    return () => {
      console.log("Cleaning up admin dashboard real-time subscriptions");
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  // Re-fetch when sort criteria changes
  useEffect(() => {
    if (!isLoading) {
      console.log("Sort criteria changed, refetching users");
      fetchUsers();
    }
  }, [sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (field === sortField) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      console.log(`Changing sort direction to ${newDirection} for field ${field}`);
      setSortDirection(newDirection);
    } else {
      console.log(`Changing sort field from ${sortField} to ${field}`);
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle opening add funds modal
  const handleOpenAddFundsModal = (user: any) => {
    setSelectedUser(user);
    setShowAddFundsModal(true);
  };

  // Force refresh users
  const handleForceRefresh = () => {
    console.log("Force refreshing user data");
    fetchUsers();
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  return (
    <div className="space-y-6">
      <UserManagementHeader 
        onRefresh={fetchUsers} 
        isRefreshing={isRefreshing} 
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        <SearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          resultsCount={filteredUsers.length} 
        />

        {isLoading ? (
          <TableSkeleton />
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
            <Button variant="link" onClick={handleForceRefresh} className="ml-2">
              Actualiser manuellement
            </Button>
          </div>
        ) : (
          <UserTable 
            users={filteredUsers}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onAddFunds={handleOpenAddFundsModal}
          />
        )}
      </div>

      {/* Add Funds Modal */}
      <AddFundsModal 
        user={selectedUser}
        adminUserId={adminUser?.id || ''}
        isOpen={showAddFundsModal}
        onClose={() => setShowAddFundsModal(false)}
        onSuccess={fetchUsers}
      />

      {/* Debug information panel */}
      <div className="mt-10 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-sm font-medium mb-2">Informations de débogage :</h3>
        <p className="text-xs">Nombre d'utilisateurs chargés : {users.length}</p>
        <p className="text-xs">Nombre d'utilisateurs filtrés : {filteredUsers.length}</p>
        <p className="text-xs">Statut d'abonnement : {subscriptionStatus}</p>
        <p className="text-xs">Critère de tri : {sortField} ({sortDirection})</p>
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleForceRefresh}
            className="text-xs"
          >
            Forcer l'actualisation
          </Button>
        </div>
      </div>
    </div>
  );
}
