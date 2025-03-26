
import React from 'react';
import { useProfileManagement } from '@/components/admin/profiles/useProfileManagement';
import ProfilesTable from '@/components/admin/profiles/ProfilesTable';
import AddFundsDialog from '@/components/admin/profiles/funds/AddFundsDialog';
import ProfileSearch from '@/components/admin/profiles/ProfileSearch';
import ProfileHeader from '@/components/admin/profiles/ProfileHeader';
import LoadingState from '@/components/admin/profiles/LoadingState';
import { Search } from 'lucide-react';

export default function ProfileManagement() {
  const {
    profiles,
    isLoading,
    searchTerm,
    setSearchTerm,
    isRefreshing,
    totalProfiles,
    isAddFundsDialogOpen,
    setIsAddFundsDialogOpen,
    amountToAdd,
    setAmountToAdd,
    isProcessing,
    filteredProfiles,
    handleRefresh,
    handleAddFundsToAll
  } = useProfileManagement();

  return (
    <div className="space-y-6 p-6">
      <ProfileHeader 
        totalProfiles={totalProfiles}
        onOpenAddFundsDialog={() => setIsAddFundsDialogOpen(true)}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <ProfileSearch 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      <div className="bg-white rounded-md shadow">
        {isLoading ? (
          <LoadingState />
        ) : (
          <ProfilesTable 
            profiles={profiles}
            isLoading={isLoading}
            filteredProfiles={filteredProfiles}
          />
        )}
      </div>

      <AddFundsDialog 
        isOpen={isAddFundsDialogOpen}
        onOpenChange={setIsAddFundsDialogOpen}
        amountToAdd={amountToAdd}
        setAmountToAdd={setAmountToAdd}
        handleAddFundsToAll={handleAddFundsToAll}
        isProcessing={isProcessing}
        totalProfiles={totalProfiles}
      />
    </div>
  );
}
