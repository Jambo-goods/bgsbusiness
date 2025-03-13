
import React from 'react';
import WithdrawalRequestsTable from '@/components/admin/dashboard/WithdrawalRequestsTable';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function AllWithdrawals() {
  const [refreshCounter, setRefreshCounter] = React.useState(0);

  const handleRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-bgs-blue">Toutes les Demandes de Retrait</h1>
        
        <Button 
          onClick={handleRefresh}
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualiser</span>
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4">
        <WithdrawalRequestsTable key={refreshCounter} onRefresh={handleRefresh} />
      </div>
    </div>
  );
}
