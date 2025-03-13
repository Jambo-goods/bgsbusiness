
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ProfilesHeaderProps {
  totalProfiles: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const ProfilesHeader: React.FC<ProfilesHeaderProps> = ({ 
  totalProfiles, 
  isRefreshing,
  onRefresh
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <p className="text-gray-500">
          {totalProfiles} {totalProfiles === 1 ? 'utilisateur' : 'utilisateurs'} au total
        </p>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2"
      >
        <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
        Actualiser
      </Button>
    </div>
  );
};

export default ProfilesHeader;
