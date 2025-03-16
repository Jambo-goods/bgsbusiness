
import React, { useEffect, useState } from "react";
import { RefreshCcw, CalculatorIcon, AlertCircle } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export function WalletCard() {
  const { 
    walletBalance, 
    isLoadingBalance, 
    refreshBalance, 
    recalculateBalance 
  } = useWalletBalance();
  
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // When component mounts, make sure balance is up to date
  useEffect(() => {
    const updateBalanceOnLoad = async () => {
      try {
        await refreshBalance();
        setLastUpdate(new Date());
        console.log("Balance refreshed on component mount");
      } catch (error) {
        console.error("Error refreshing balance on mount:", error);
        setShowRefreshAlert(true);
      }
    };
    
    updateBalanceOnLoad();
  }, [refreshBalance]);

  const handleRefresh = async () => {
    try {
      await refreshBalance();
      setLastUpdate(new Date());
      setShowRefreshAlert(false);
      toast.success("Solde actualisé");
    } catch (error) {
      console.error("Refresh error:", error);
      setShowRefreshAlert(true);
      toast.error("Erreur lors de l'actualisation du solde");
    }
  };

  const handleForceRecalculate = async () => {
    toast.loading("Recalcul forcé du solde en cours...");
    try {
      await recalculateBalance();
      setLastUpdate(new Date());
      setShowRefreshAlert(false);
      toast.success("Recalcul du solde terminé");
    } catch (error) {
      console.error("Force recalculate error:", error);
      setShowRefreshAlert(true);
      toast.error("Erreur lors du recalcul du solde");
    }
  };

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-bgs-blue">Solde disponible</h3>
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleRefresh} 
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Rafraîchir le solde"
                    disabled={isLoadingBalance}
                  >
                    <RefreshCcw className={`h-4 w-4 text-bgs-blue ${isLoadingBalance ? 'animate-spin' : ''}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rafraîchir le solde</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleForceRecalculate} 
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Recalculer le solde"
                    disabled={isLoadingBalance}
                  >
                    <CalculatorIcon className={`h-4 w-4 text-bgs-blue ${isLoadingBalance ? 'animate-spin' : ''}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Recalculer le solde</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {isLoadingBalance ? (
          <Skeleton className="h-10 w-32 mt-2" />
        ) : (
          <div className="flex items-baseline">
            <span className={`text-3xl font-bold ${walletBalance < 0 ? 'text-red-500' : 'text-bgs-blue'}`}>
              {walletBalance.toLocaleString('fr-FR')}
            </span>
            <span className={`ml-1 text-xl ${walletBalance < 0 ? 'text-red-500' : 'text-bgs-blue'}`}>€</span>
          </div>
        )}
        
        {showRefreshAlert && (
          <Alert className="mt-4 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Si vous avez fait un retrait ou dépôt récemment, veuillez cliquer sur "Recalculer" pour mettre à jour votre solde.
            </AlertDescription>
          </Alert>
        )}
        
        <p className="text-sm text-gray-500 mt-4">
          Votre solde est mis à jour automatiquement lorsque vos virements sont confirmés et vos retraits approuvés.
          {lastUpdate && (
            <span className="block text-xs text-gray-400 mt-1">
              Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
