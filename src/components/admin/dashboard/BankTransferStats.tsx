
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface BankTransferStatsProps {
  transfers: any[];
  isLoading: boolean;
}

const BankTransferStats: React.FC<BankTransferStatsProps> = ({ transfers, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse h-20 bg-gray-200 rounded-md"></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse h-20 bg-gray-200 rounded-md"></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse h-20 bg-gray-200 rounded-md"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats (placeholders for now)
  const totalPending = transfers?.filter(t => t.status === 'pending')?.length || 0;
  const totalAmount = transfers?.reduce((acc, t) => acc + (t.amount || 0), 0) || 0;
  const averageAmount = transfers?.length ? Math.round(totalAmount / transfers.length) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-gray-500">Virements en attente</p>
          <h3 className="text-2xl font-bold mt-1">{totalPending}</h3>
          <p className="text-xs text-gray-500 mt-1">Requiert votre attention</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-gray-500">Montant total</p>
          <h3 className="text-2xl font-bold mt-1">{totalAmount} €</h3>
          <p className="text-xs text-gray-500 mt-1">Tous les virements</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-gray-500">Montant moyen</p>
          <h3 className="text-2xl font-bold mt-1">{averageAmount} €</h3>
          <p className="text-xs text-gray-500 mt-1">Par virement</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankTransferStats;
