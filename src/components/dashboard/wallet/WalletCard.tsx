
import React, { useEffect, useState, useCallback } from "react";
import { RefreshCcw, CalculatorIcon, AlertCircle } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notifications";

export function WalletCard() {
  const { 
    walletBalance, 
    isLoadingBalance, 
    refreshBalance, 
    recalculateBalance,
    updateBalanceOnWithdrawal
  } = useWalletBalance();
  
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  useEffect(() => {
    // No longer automatically recalculate on component mount
    // Only set up the real-time subscriptions
    
    const setupWithdrawalSubscriptions = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) return;
      
      console.log("Setting up withdrawal subscriptions for WalletCard");
      
      const withdrawalChannel = supabase
        .channel('wallet-card-withdrawal-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // All events
            schema: 'public',
            table: 'withdrawal_requests',
            filter: `user_id=eq.${userId}`
          },
          async (payload) => {
            console.log("Withdrawal request changed, WalletCard notified:", payload);
            
            if (payload.eventType === 'INSERT') {
              await refreshBalance();
              return;
            }
            
            if (payload.eventType === 'UPDATE') {
              const oldStatus = payload.old?.status;
              const newStatus = payload.new?.status;
              
              console.log(`Withdrawal status changed from ${oldStatus} to ${newStatus}`);
              
              if (payload.new?.amount && newStatus !== oldStatus) {
                notificationService.withdrawalStatus(
                  payload.new.amount, 
                  newStatus === 'scheduled' ? 'processing' : newStatus
                );
              }
              
              await refreshBalance();
              setLastUpdate(new Date());
            }
          }
        )
        .subscribe((status) => {
          console.log("Withdrawal subscription status for WalletCard:", status);
        });
        
      const bankTransferChannel = supabase
        .channel('wallet-card-bank-transfer-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bank_transfers',
            filter: `user_id=eq.${userId}`
          },
          async (payload) => {
            console.log("Bank transfer updated, WalletCard notified:", payload);
            
            if (payload.new?.status === 'reçu' || payload.new?.status === 'received') {
              if (payload.new.amount) {
                notificationService.depositSuccess(payload.new.amount);
              }
              
              await refreshBalance();
              setLastUpdate(new Date());
            }
          }
        )
        .subscribe((status) => {
          console.log("Bank transfer subscription status for WalletCard:", status);
        });
      
      return [withdrawalChannel, bankTransferChannel];
    };
    
    // Set up subscriptions
    const subscriptionPromise = setupWithdrawalSubscriptions();
    
    // Initial balance fetch
    refreshBalance();
    setLastUpdate(new Date());
    
    return () => {
      subscriptionPromise.then(channels => {
        channels?.forEach(channel => {
          if (channel) supabase.removeChannel(channel);
        });
      });
    };
  }, [refreshBalance, updateBalanceOnWithdrawal, recalculateBalance]);

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refreshBalance();
      setLastUpdate(new Date());
      setShowRefreshAlert(false);
      toast.success("Solde actualisé");
    } catch (error) {
      console.error("Refresh error:", error);
      setShowRefreshAlert(true);
      toast.error("Erreur lors de l'actualisation du solde");
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const handleForceRecalculate = async () => {
    setIsRecalculating(true);
    const toastId = toast.loading("Recalcul forcé du solde en cours...");
    try {
      await recalculateBalance();
      setLastUpdate(new Date());
      setShowRefreshAlert(false);
      toast.success("Recalcul du solde terminé", { id: toastId });
    } catch (error) {
      console.error("Force recalculate error:", error);
      setShowRefreshAlert(true);
      toast.error("Erreur lors du recalcul du solde", { id: toastId });
    } finally {
      setIsRecalculating(false);
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
                    disabled={isLoadingBalance || isManualRefreshing}
                  >
                    <RefreshCcw className={`h-4 w-4 text-bgs-blue ${isManualRefreshing ? 'animate-spin' : ''}`} />
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
                    disabled={isLoadingBalance || isRecalculating}
                  >
                    <CalculatorIcon className={`h-4 w-4 text-bgs-blue ${isRecalculating ? 'animate-spin' : ''}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Recalculer le solde</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {isLoadingBalance || isManualRefreshing || isRecalculating ? (
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
          Votre solde est mis à jour manuellement. Utilisez les boutons ci-dessus pour actualiser ou recalculer.
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
