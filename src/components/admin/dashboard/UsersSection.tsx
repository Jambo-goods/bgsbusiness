
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProfilesTable from "@/components/admin/users/ProfilesTable";
import { UserProfile } from "@/hooks/admin/types";

interface UsersSectionProps {
  profiles: UserProfile[];
  filteredProfiles: UserProfile[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refreshProfiles: () => void;
  onAddFunds: (userId: string) => void;
}

export default function UsersSection({
  profiles,
  filteredProfiles,
  isLoading,
  searchTerm,
  setSearchTerm,
  refreshProfiles,
  onAddFunds
}: UsersSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-bgs-blue">
          Utilisateurs enregistrés
        </h2>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button 
            onClick={() => refreshProfiles()}
            variant="outline"
          >
            Actualiser
          </Button>
        </div>
      </div>
      
      <ProfilesTable 
        profiles={profiles} 
        filteredProfiles={filteredProfiles} 
        isLoading={isLoading} 
        searchTerm={searchTerm}
        onAddFunds={onAddFunds}
      />
    </div>
  );
}
