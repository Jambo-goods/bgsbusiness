
import React from 'react';
import { Button } from '@/components/ui/button';
import StatusIndicator from '@/components/admin/dashboard/StatusIndicator';
import { Users, PlusCircle, RefreshCw } from 'lucide-react';

interface ProfileHeaderProps {
  totalProfiles: number;
  onOpenAddFundsDialog: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  totalProfiles,
  onOpenAddFundsDialog,
  isRefreshing,
  onRefresh
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Gestion des Profils</h1>
        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
          {totalProfiles} utilisateurs
        </span>
      </div>
      
      <div className="flex gap-3">
        <Button 
          onClick={onOpenAddFundsDialog}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Ajouter des fonds à tous
        </Button>
        <Button
          variant="outline"
          onClick={onRefresh}
          className="flex items-center gap-2"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>
    </div>
  );
};

export default ProfileHeader;
