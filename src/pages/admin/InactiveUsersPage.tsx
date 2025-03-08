
import React from 'react';
import SearchBar from '@/components/admin/users/SearchBar';
import ProfilesTable from '@/components/admin/users/ProfilesTable';
import { AdminUsersProvider, useAdminUsers } from '@/contexts/AdminUsersContext';

function InactiveUsersContent() {
  const { 
    profiles,
    filteredProfiles, 
    isLoading, 
    searchTerm, 
    setSearchTerm,
    totalProfiles
  } = useAdminUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
            {totalProfiles} utilisateurs
          </span>
        </div>
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

export default function InactiveUsersPage() {
  return (
    <AdminUsersProvider>
      <InactiveUsersContent />
    </AdminUsersProvider>
  );
}
