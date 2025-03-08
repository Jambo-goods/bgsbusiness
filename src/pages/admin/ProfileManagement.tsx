
import React, { useState } from 'react';
import { useProfilesData } from '@/hooks/admin/useProfilesData';
import AddFundsDialog from '@/components/admin/profiles/AddFundsDialog';
import ProfilesTable from '@/components/admin/profiles/ProfilesTable';
import ProfileSearch from '@/components/admin/profiles/ProfileSearch';
import ProfilesHeader from '@/components/admin/profiles/ProfilesHeader';

export default function ProfileManagement() {
  const {
    profiles,
    isLoading,
    isRefreshing,
    realTimeStatus,
    totalProfiles,
    handleRefresh,
    fetchProfiles
  } = useProfilesData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddFundsDialogOpen, setIsAddFundsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <ProfilesHeader 
        totalProfiles={totalProfiles}
        onAddFunds={() => setIsAddFundsDialogOpen(true)}
        realTimeStatus={realTimeStatus}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      <ProfileSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div className="bg-white rounded-md shadow">
        <ProfilesTable 
          profiles={profiles}
          isLoading={isLoading}
          searchTerm={searchTerm}
        />
      </div>

      <AddFundsDialog 
        isOpen={isAddFundsDialogOpen}
        onClose={() => setIsAddFundsDialogOpen(false)}
        profiles={profiles}
        onSuccess={fetchProfiles}
      />
    </div>
  );
}
