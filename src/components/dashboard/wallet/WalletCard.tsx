
import React from 'react';
import { ArrowDown, ArrowUp, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface WalletCardProps {
  balance: number;
  pendingDeposits?: number;
  pendingWithdrawals?: number;
}

export function WalletCard({ 
  balance = 0, 
  pendingDeposits = 0, 
  pendingWithdrawals = 0 
}: WalletCardProps) {
  // Calculate available balance
  const availableBalance = balance;
  
  // Format the values for display
  const formattedBalance = balance.toString();
  const formattedAvailableBalance = availableBalance.toString();
  const formattedPendingDeposits = pendingDeposits.toString();
  const formattedPendingWithdrawals = pendingWithdrawals.toString();
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-bgs-blue">Votre portefeuille</h3>
          <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
            Actif
          </span>
        </div>
        
        <div className="space-y-6">
          {/* Balance */}
          <div>
            <p className="text-sm text-bgs-gray-medium mb-1">Solde total</p>
            <p className="text-3xl font-bold text-bgs-blue">{formattedBalance} €</p>
          </div>
          
          {/* Available Balance */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-1">
              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-sm text-bgs-blue">Solde disponible</p>
            </div>
            <p className="text-xl font-semibold text-bgs-blue">{formattedAvailableBalance} €</p>
          </div>
          
          {/* Pending Transactions */}
          <div className="grid grid-cols-2 gap-4">
            {/* Pending Deposits */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <ArrowDown className="h-4 w-4 text-blue-500 mr-1" />
                <p className="text-xs text-bgs-gray-medium">Dépôts en attente</p>
              </div>
              <p className="text-lg font-medium text-bgs-blue">{formattedPendingDeposits} €</p>
            </div>
            
            {/* Pending Withdrawals */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <Clock className="h-4 w-4 text-orange-500 mr-1" />
                <p className="text-xs text-bgs-gray-medium">Retraits en attente</p>
              </div>
              <p className="text-lg font-medium text-bgs-blue">{formattedPendingWithdrawals} €</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
