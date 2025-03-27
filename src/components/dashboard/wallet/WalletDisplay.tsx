
import React, { useState } from "react";
import { WalletCard } from "./WalletCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";

export function WalletDisplay() {
  const { walletBalance, isLoadingBalance, refreshBalance } = useWalletBalance();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance(true); // Show loading state for manual refresh
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Votre portefeuille</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualRefresh}
          className="flex items-center gap-1"
          disabled={isLoadingBalance || isRefreshing}
        >
          <RefreshCw className={`h-3 w-3 ${isLoadingBalance || isRefreshing ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </Button>
      </div>
      <WalletCard 
        balance={walletBalance} 
        isLoading={isLoadingBalance} 
        onManualRefresh={handleManualRefresh}
      />
    </div>
  );
}
