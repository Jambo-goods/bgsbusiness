
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';

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

  // Handle opening add funds modal
  const handleOpenAddFundsModal = (user: any) => {
    setSelectedUser(user);
    setShowAddFundsModal(true);
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
    </div>
  );
}
