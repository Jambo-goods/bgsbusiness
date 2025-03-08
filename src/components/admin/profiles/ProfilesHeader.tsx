
import React from 'react';
import { Button } from '@/components/ui/button';
import StatusIndicator from '@/components/admin/dashboard/StatusIndicator';
import { RealTimeStatus } from '@/hooks/admin/useProfilesData';

interface ProfilesHeaderProps {
  totalProfiles: number;
  onAddFunds: () => void;
  realTimeStatus: RealTimeStatus;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function ProfilesHeader({
  totalProfiles,
  onAddFunds,
  realTimeStatus,
  isRefreshing,
  onRefresh
}: ProfilesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Gestion des Profils</h1>
        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
          {totalProfiles} utilisateurs
        </span>
      </div>
      
      <div className="flex gap-3">
        <Button 
          onClick={onAddFunds}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Ajouter des fonds à tous
        </Button>
        <StatusIndicator 
          realTimeStatus={realTimeStatus} 
          isRefreshing={isRefreshing} 
          onRefresh={onRefresh} 
        />
      </div>
    </div>
  );
}
