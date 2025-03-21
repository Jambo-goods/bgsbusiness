
import React, { useEffect, useState } from "react";
import { WalletCard } from "./WalletCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";

export function WalletDisplay() {
  const { walletBalance, isLoadingBalance, refreshBalance } = useWalletBalance();
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Force refresh every 3 seconds to ensure balance is up-to-date
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refreshBalance(false); // Silent refresh (no loading state)
      setLastRefreshed(new Date());
    }, 3000); // Every 3 seconds

    return () => clearInterval(refreshInterval);
  }, [refreshBalance]);

  const handleManualRefresh = () => {
    refreshBalance(true); // Show loading state for manual refresh
    setLastRefreshed(new Date());
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
          disabled={isLoadingBalance}
        >
          <RefreshCw className={`h-3 w-3 ${isLoadingBalance ? 'animate-spin' : ''}`} />
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
