
import React, { useState } from 'react';
import { useAdminUsers } from '@/contexts/AdminUsersContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw } from 'lucide-react';
import ProfilesTable from '@/components/admin/profiles/ProfilesTable';
import { Helmet } from 'react-helmet-async';

export default function ProfileManagement() {
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
    <>
      <Helmet>
        <title>Gestion des utilisateurs | Admin</title>
      </Helmet>
      
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 sm:mb-0">Gestion des utilisateurs ({totalProfiles})</h1>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher par nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-medium">Liste des utilisateurs</h2>
          </CardHeader>
          <CardContent className="p-0">
            <ProfilesTable
              profiles={filteredProfiles}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
