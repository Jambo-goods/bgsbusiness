
import React, { useState, useEffect } from "react";
import { WalletCard } from "./WalletCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useLocation } from "react-router-dom";

export function WalletDisplay() {
  const { walletBalance, isLoadingBalance, refreshBalance } = useWalletBalance();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const location = useLocation();

  // S'assurer que le solde est rafraîchi quand on accède à la page
  useEffect(() => {
    if (location.pathname.includes('/wallet')) {
      refreshBalance(false);
    }
  }, [location.pathname, refreshBalance]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance(true); // Afficher l'état de chargement pour les actualisations manuelles
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
