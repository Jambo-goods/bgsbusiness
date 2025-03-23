
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReferralsHeaderProps {
  refreshData: () => void;
}

const ReferralsHeader: React.FC<ReferralsHeaderProps> = ({ refreshData }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestion des Parrainages</h1>
        <p className="text-muted-foreground mt-1">
          Consultez et gérez les relations de parrainage entre utilisateurs
        </p>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={refreshData} 
        className="flex items-center gap-1"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Actualiser</span>
      </Button>
    </div>
  );
};

export default ReferralsHeader;
