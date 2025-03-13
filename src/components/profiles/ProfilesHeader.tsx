
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ProfilesHeaderProps {
  totalProfiles: number;
  isRefreshing: boolean;
  handleRefresh: () => void;
}

const ProfilesHeader: React.FC<ProfilesHeaderProps> = ({ 
  totalProfiles, 
  isRefreshing, 
  handleRefresh 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Liste Complète des Profils</h1>
        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
          {totalProfiles} utilisateurs
        </span>
      </div>
      
      <div className="flex gap-3">
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          className="flex items-center gap-2" 
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </Button>
      </div>
    </div>
  );
};

export default ProfilesHeader;
