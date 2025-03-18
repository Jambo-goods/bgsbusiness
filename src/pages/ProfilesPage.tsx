
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Info } from "lucide-react";
import useProfiles from "@/hooks/useProfiles";
import ProfileList from "@/components/profiles/ProfileList";
import ProfileSearch from "@/components/profiles/ProfileSearch";
import ProfilesHeader from "@/components/profiles/ProfilesHeader";
import LoadingState from "@/components/profiles/LoadingState";
import { Toaster } from "sonner";

export default function ProfilesPage() {
  const {
    filteredProfiles,
    isLoading,
    searchTerm,
    setSearchTerm,
    totalCount,
    refreshProfiles
  } = useProfiles();

  console.log("ProfilesPage: Affichage de", filteredProfiles.length, "profils filtrés sur", totalCount, "au total");

  return (
    <div className="min-h-full">
      <Toaster />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Tous les Profils Utilisateurs ({totalCount})</h1>
        
        <Card className="bg-white rounded-lg shadow">
          <CardHeader className="pb-2">
            <ProfilesHeader 
              totalCount={totalCount} 
              isLoading={isLoading} 
              onRefresh={refreshProfiles} 
            />
          </CardHeader>
          <CardContent>
            <ProfileSearch 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
            />
            
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
              <Info className="h-4 w-4" />
              <span>Affichage de {filteredProfiles.length} profils sur {totalCount} au total</span>
            </div>

            {isLoading ? (
              <LoadingState />
            ) : (
              <ProfileList 
                profiles={filteredProfiles} 
                isLoading={isLoading} 
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
