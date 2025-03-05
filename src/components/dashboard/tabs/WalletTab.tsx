
import React from "react";
import { useSearchParams } from "react-router-dom";
import WalletBalance from "./wallet/WalletBalance";
import ActionButtons from "./wallet/ActionButtons";
import WalletHistory from "./wallet/WalletHistory";
import { useWallet } from "@/hooks/use-wallet";

export default function WalletTab() {
  const [searchParams] = useSearchParams();
  const shouldTriggerDeposit = searchParams.get('action') === 'deposit';
  
  const {
    balance,
    transactions,
    loading,
    isDepositing,
    isWithdrawing,
    handleDeposit,
    handleWithdraw
  } = useWallet(shouldTriggerDeposit);

  return (
    <div className="space-y-6">
      <WalletBalance balance={balance} />
      <ActionButtons 
        onDeposit={handleDeposit} 
        onWithdraw={handleWithdraw} 
        isDepositing={isDepositing}
        isWithdrawing={isWithdrawing}
      />
      <WalletHistory transactions={transactions} isLoading={loading} />
    </div>
  );
}
