
import React from 'react';
import { useAllProfiles } from '@/hooks/useAllProfiles';
import ProfilesTable from '@/components/profiles/ProfilesTable';
import ProfilesHeader from '@/components/profiles/ProfilesHeader';
import ProfileSearch from '@/components/profiles/ProfileSearch';

export default function AllProfiles() {
  const {
    profiles,
    isLoading,
    searchTerm,
    setSearchTerm,
    totalProfiles,
    filteredProfiles,
    isRefreshing,
    handleRefresh
  } = useAllProfiles();

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfilesHeader 
        totalProfiles={totalProfiles} 
        isRefreshing={isRefreshing} 
        onRefresh={handleRefresh}
      />
      
      <div className="my-6">
        <ProfileSearch 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />
      </div>
      
      <ProfilesTable 
        profiles={profiles}
        isLoading={isLoading}
        filteredProfiles={filteredProfiles}
      />
    </div>
  );
}
