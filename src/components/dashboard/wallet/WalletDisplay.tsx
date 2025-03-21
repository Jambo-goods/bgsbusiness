
import React, { useEffect } from "react";
import { WalletCard } from "./WalletCard";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function WalletDisplay() {
  const { walletBalance, isLoadingBalance, refreshBalance, error } = useWalletBalance();

  // Force refresh on initial load and set up aggressive polling
  useEffect(() => {
    // Initial balance fetch
    refreshBalance(true);
    
    // Aggressive polling every 3 seconds for better responsiveness
    const intervalId = setInterval(() => {
      refreshBalance(false); // Silent refresh
    }, 3000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [refreshBalance]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Votre portefeuille</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refreshBalance(true)}
          disabled={isLoadingBalance}
          className="h-8 flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </Button>
      </div>
      
      {isLoadingBalance ? (
        <Skeleton className="h-24 w-full rounded-lg" />
      ) : (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100 mb-2">
          <div className="text-sm text-gray-500 mb-1">Solde disponible:</div>
          <div className="text-2xl font-bold text-bgs-blue">{walletBalance.toLocaleString('fr-FR')} €</div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      )}
      
      <WalletCard />
    </div>
  );
}
