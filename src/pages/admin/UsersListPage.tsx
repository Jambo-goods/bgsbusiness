
import React, { useState } from 'react';
import { AdminUsersProvider, useAdminUsers } from '@/contexts/AdminUsersContext';
import ProfilesTable from '@/components/admin/users/ProfilesTable';
import SearchBar from '@/components/admin/users/SearchBar';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

function UsersListContent() {
  const { 
    profiles, 
    filteredProfiles, 
    isLoading, 
    searchTerm, 
    setSearchTerm, 
    totalProfiles,
    refreshProfiles
  } = useAdminUsers();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProfiles();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Liste des utilisateurs</h1>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
            {totalProfiles} utilisateurs
          </span>
        </div>
        
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </div>

      <SearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        placeholder="Rechercher par nom, prénom ou email..."
      />

      <div className="bg-white rounded-md shadow">
        <ProfilesTable
          profiles={profiles}
          filteredProfiles={filteredProfiles}
          isLoading={isLoading}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  );
}

export default function UsersListPage() {
  return (
    <AdminUsersProvider>
      <UsersListContent />
    </AdminUsersProvider>
  );
}
