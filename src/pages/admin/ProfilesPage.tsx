
import React, { useState } from 'react';
import { useAdminUsers } from '@/contexts/AdminUsersContext';
import ProfilesTable from '@/components/admin/profiles/ProfilesTable';
import ProfileSearch from '@/components/admin/profiles/ProfileSearch';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import LoadingState from '@/components/admin/profiles/LoadingState';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';

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
          ) : (
            <ProfilesTable 
              profiles={profiles}
              filteredProfiles={filteredProfiles}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
