
import React from 'react';
import { Helmet } from "react-helmet-async";
import { useAllProfiles } from '@/hooks/useAllProfiles';
import ProfilesTable from '@/components/profiles/ProfilesTable';
import ProfileSearch from '@/components/profiles/ProfileSearch';
import ProfilesHeader from '@/components/profiles/ProfilesHeader';

export default function AllProfiles() {
  const {
    isLoading,
    searchTerm,
    setSearchTerm,
    isRefreshing,
    totalProfiles,
    filteredProfiles,
    handleRefresh
  } = useAllProfiles();

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Tous les Profils | BGS Invest</title>
        <meta name="description" content="Liste complète de tous les profils enregistrés" />
      </Helmet>
      
      <div className="space-y-6">
        <ProfilesHeader 
          totalProfiles={totalProfiles}
          isRefreshing={isRefreshing}
          handleRefresh={handleRefresh}
        />

        <ProfileSearch 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <div className="bg-white rounded-md shadow">
          <ProfilesTable 
            filteredProfiles={filteredProfiles}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
