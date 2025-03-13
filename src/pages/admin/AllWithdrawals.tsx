
import React from 'react';
import WithdrawalRequestsTable from '@/components/admin/dashboard/WithdrawalRequestsTable';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database } from 'lucide-react';

export default function AllWithdrawals() {
  const [refreshCounter, setRefreshCounter] = React.useState(0);

  const handleRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-bgs-blue" />
          <h1 className="text-2xl font-semibold text-bgs-blue">Base de données - Demandes de Retrait</h1>
        </div>
        
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
        <div className="mb-4 text-sm text-gray-500">
          <p>Tableau : <code className="bg-gray-100 px-2 py-1 rounded">withdrawal_requests</code></p>
        </div>
        <WithdrawalRequestsTable key={refreshCounter} onRefresh={handleRefresh} />
      </div>
    </div>
  );
}
