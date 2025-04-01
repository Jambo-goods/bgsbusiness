
import React, { useState, useEffect } from 'react';
import { useAdminUsers } from '@/contexts/AdminUsersContext';
import ProfilesTable from '@/components/admin/profiles/ProfilesTable';
import ProfileSearch from '@/components/admin/profiles/ProfileSearch';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import LoadingState from '@/components/admin/profiles/LoadingState';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

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
  
  console.log("ProfilesPage - Current state:", { 
    isLoading, 
    profilesCount: profiles.length,
    filteredProfilesCount: filteredProfiles.length
  });

  const handleRefresh = async () => {
    console.log("Starting refresh...");
    setIsRefreshing(true);
    try {
      await refreshProfiles();
      toast.success("Profils actualisés avec succès");
    } catch (error) {
      console.error("Error refreshing profiles:", error);
      toast.error("Erreur lors de l'actualisation des profils");
    } finally {
      setIsRefreshing(false);
      console.log("Refresh complete");
    }
  };

  useEffect(() => {
    // Force initial data load on component mount
    const loadInitialData = async () => {
      try {
        await refreshProfiles();
        console.log("Initial profiles loaded:", profiles.length);
      } catch (error) {
        console.error("Failed to load initial profiles:", error);
      }
    };
    
    loadInitialData();
  }, []);

  useEffect(() => {
    console.log("ProfilesPage - profiles updated:", profiles.length);
    console.log("Filtered profiles:", filteredProfiles.length);
    if (profiles.length > 0) {
      console.log("Sample profile:", profiles[0]);
    }
  }, [profiles, filteredProfiles]);

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
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <LoadingState />
            </div>
          ) : profiles.length === 0 ? (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Aucun profil trouvé</AlertTitle>
              <AlertDescription>
                Aucun utilisateur n'a été trouvé dans la base de données.
              </AlertDescription>
            </Alert>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun utilisateur ne correspond à votre recherche
            </div>
          ) : (
            <ProfilesTable 
              profiles={filteredProfiles}
              isLoading={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
