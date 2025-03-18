
import React from 'react';
import WalletBalance from './wallet/WalletBalance';
import { ActionButtons } from './wallet/ActionButtons';
import WithdrawalRequestsTable from './wallet/WithdrawalRequestsTable';
import BankTransferInstructions from './wallet/BankTransferInstructions';
import WalletHistory from './wallet/WalletHistory';
import { useWalletData } from '@/hooks/dashboard/useWalletData';

export default function WalletTab() {
  const { walletBalance, walletChange } = useWalletData();
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-bgs-blue">Mon portefeuille</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WalletBalance balance={walletBalance} change={walletChange} />
        </div>
        <div className="lg:col-span-1">
          <ActionButtons />
        </div>
      </div>
      
      <div className="space-y-8">
        <BankTransferInstructions />
        <WithdrawalRequestsTable />
        <WalletHistory />
      </div>
    </div>
  );
}
