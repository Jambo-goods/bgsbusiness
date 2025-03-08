
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Download, CircleDollarSign, Clock, UserCheck } from 'lucide-react';

interface FinanceStatsProps {
  stats: {
    totalDeposits: number;
    totalWithdrawals: number;
    totalBalance: number;
    pendingWithdrawalsAmount: number;
    transactionCount: number;
  };
  pendingWithdrawals: number;
  totalProfiles: number;
}

const FinanceStats: React.FC<FinanceStatsProps> = ({ 
  stats, 
  pendingWithdrawals, 
  totalProfiles 
}) => {
  const formatAmount = (amount: number) => `${amount.toLocaleString()} €`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total des dépôts</p>
              <p className="text-2xl font-bold text-green-600">{formatAmount(stats.totalDeposits)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Upload className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total des retraits</p>
              <p className="text-2xl font-bold text-red-600">{formatAmount(stats.totalWithdrawals)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Download className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Solde total</p>
              <p className="text-2xl font-bold text-bgs-blue">{formatAmount(stats.totalBalance)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CircleDollarSign className="h-5 w-5 text-bgs-blue" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Retraits en attente</p>
              <p className="text-2xl font-bold text-amber-600">
                {pendingWithdrawals} ({formatAmount(stats.pendingWithdrawalsAmount)})
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Utilisateurs</p>
              <p className="text-2xl font-bold text-purple-600">{totalProfiles}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <UserCheck className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceStats;
