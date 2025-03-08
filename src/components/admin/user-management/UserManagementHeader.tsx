
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface UserManagementHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const UserManagementHeader = ({ onRefresh, isRefreshing }: UserManagementHeaderProps) => {
  const handleRefresh = () => {
    onRefresh();
    toast.info("Actualisation des données en cours...");
  };

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-bgs-blue">Gestion des utilisateurs</h1>
      <Button onClick={handleRefresh} disabled={isRefreshing}>
        <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Actualiser
      </Button>
    </div>
  );
};
