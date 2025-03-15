
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useWalletTransactionUpdates } from "@/hooks/dashboard/useWalletTransactionUpdates";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export function WalletBalance() {
  const { walletBalance, isLoadingBalance, refreshBalance } = useWalletBalance();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Set up real-time updates for wallet transactions
  useWalletTransactionUpdates(() => {
    console.log("Wallet transaction updated, refreshing balance");
    refreshBalance();
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">
          Solde disponible
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        {isLoadingBalance ? (
          <div className="animate-pulse h-10 bg-gray-200 rounded-md" />
        ) : (
          <div className="text-3xl font-bold text-bgs-blue py-2">
            {walletBalance.toLocaleString()} €
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Dernière mise à jour: {new Date().toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}
