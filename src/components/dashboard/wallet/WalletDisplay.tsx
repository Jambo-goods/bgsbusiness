
import { WalletCard } from "./WalletCard";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

export function WalletDisplay() {
  const { walletBalance, isLoadingBalance, refreshBalance } = useWalletBalance();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Auto-refresh wallet balance when component mounts
  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Votre portefeuille</h2>
        <button 
          onClick={handleRefresh} 
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>
      <WalletCard 
        balance={walletBalance} 
        isLoading={isLoadingBalance}
      />
    </div>
  );
}
