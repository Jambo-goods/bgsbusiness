
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export interface HistoryHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const HistoryHeader = ({ onRefresh, isRefreshing }: HistoryHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-800">Historique des opérations</h3>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onRefresh}
        disabled={isRefreshing}
        className="text-gray-600"
      >
        <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
        Actualiser
      </Button>
    </div>
  );
};

export default HistoryHeader;
