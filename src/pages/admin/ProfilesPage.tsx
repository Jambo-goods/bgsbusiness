
import React, { useState } from 'react';
import { useAdminUsers } from '@/contexts/AdminUsersContext';
import ProfilesTable from '@/components/admin/profiles/ProfilesTable';
import ProfileSearch from '@/components/admin/profiles/ProfileSearch';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import LoadingState from '@/components/admin/profiles/LoadingState';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Profile as AdminProfileType } from '@/components/admin/profiles/types';

export default function ProfilesPage() {
  const {
    profiles,
    isLoading,
    searchTerm,
    setSearchTerm,
    totalProfiles,
    filteredProfiles,
    refreshProfiles
  } = useAdminUsers();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProfiles();
    setIsRefreshing(false);
  };

  // Map profiles to the format expected by ProfilesTable
  const mappedProfiles: AdminProfileType[] = profiles.map(profile => ({
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    phone: profile.phone,
    address: profile.address || null,
    wallet_balance: profile.wallet_balance,
    projects_count: profile.projects_count || 0,
    investment_total: profile.investment_total || 0,
    created_at: profile.created_at,
    last_active_at: profile.last_active_at,
  }));

  // Map filtered profiles as well
  const mappedFilteredProfiles: AdminProfileType[] = filteredProfiles.map(profile => ({
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    phone: profile.phone,
    address: profile.address || null,
    wallet_balance: profile.wallet_balance,
    projects_count: profile.projects_count || 0,
    investment_total: profile.investment_total || 0,
    created_at: profile.created_at,
    last_active_at: profile.last_active_at,
  }));

  console.log('ProfilesPage: isLoading', isLoading);
  console.log('ProfilesPage: profiles count', profiles.length);
  console.log('ProfilesPage: filteredProfiles count', filteredProfiles.length);

  return (
    <div className="space-y-6">
      <AdminHeader 
        title="Gestion des profils" 
        description={`${totalProfiles} profils utilisateurs au total`}
      />
      
      <div className="flex items-center justify-between mb-6">
        <ProfileSearch 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingState />
          ) : mappedFilteredProfiles.length > 0 ? (
            <ProfilesTable 
              profiles={mappedProfiles}
              filteredProfiles={mappedFilteredProfiles}
              isLoading={isLoading}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun utilisateur trouvé
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
