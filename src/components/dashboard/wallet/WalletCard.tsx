
import React, { useEffect, useState, useCallback } from "react";
import { RefreshCcw, CalculatorIcon, AlertCircle } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notifications";

interface WalletCardProps {
  balance?: number;
}

export function WalletCard({ balance: propBalance }: WalletCardProps = {}) {
  const { 
    walletBalance, 
    isLoadingBalance, 
    refreshBalance, 
    recalculateBalance,
    updateBalanceOnWithdrawal
  } = useWalletBalance();
  
  // Use the prop balance if provided, otherwise use the one from the hook
  const displayBalance = propBalance !== undefined ? propBalance : walletBalance;
  
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  useEffect(() => {
    // Setup real-time subscriptions only, don't automatically recalculate
    const setupSubscriptions = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) return;
      
      console.log("Setting up wallet subscriptions for WalletCard");
      
      // Setup subscriptions for notifications only
      const withdrawalChannel = supabase
        .channel('wallet-card-withdrawal-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'withdrawal_requests',
            filter: `user_id=eq.${userId}`
          },
          async (payload) => {
            console.log("Withdrawal request changed, notification only:", payload);
            
            if (payload.eventType === 'UPDATE') {
              const oldStatus = payload.old?.status;
              const newStatus = payload.new?.status;
              
              if (payload.new?.amount && newStatus !== oldStatus) {
                if (typeof payload.new.amount === 'string') {
                  notificationService.withdrawalStatus(
                    parseFloat(payload.new.amount),
                    newStatus === 'scheduled' ? 'processing' : newStatus
                  );
                } else {
                  notificationService.withdrawalStatus(
                    payload.new.amount,
                    newStatus === 'scheduled' ? 'processing' : newStatus
                  );
                }
                setShowRefreshAlert(true);
              }
            } else if (payload.eventType === 'INSERT') {
              if (payload.new?.amount) {
                const amount = typeof payload.new.amount === 'string' 
                  ? parseFloat(payload.new.amount) 
                  : payload.new.amount;
                notificationService.withdrawalStatus(amount, 'pending');
                setShowRefreshAlert(true);
              }
            }
          }
        )
        .subscribe();
        
      // Listen for bank transfer changes
      const bankTransferChannel = supabase
        .channel('wallet-card-bank-transfer-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bank_transfers',
            filter: `user_id=eq.${userId}`
          },
          async (payload) => {
            console.log("Bank transfer changed, notification only:", payload);
            
            if (payload.eventType === 'UPDATE') {
              if (payload.new?.status === 'reçu' || payload.new?.status === 'received') {
                if (payload.new.amount) {
                  const amount = typeof payload.new.amount === 'string' 
                    ? parseFloat(payload.new.amount) 
                    : payload.new.amount;
                  notificationService.depositSuccess(amount);
                  setShowRefreshAlert(true);
                }
              }
            } else if (payload.eventType === 'INSERT') {
              if (payload.new?.amount) {
                const amount = typeof payload.new.amount === 'string' 
                  ? parseFloat(payload.new.amount) 
                  : payload.new.amount;
                toast.info("Demande de dépôt reçue", {
                  description: `Votre demande de dépôt de ${amount}€ a été reçue et est en cours de traitement.`
                });
              }
            }
          }
        )
        .subscribe();
        
      // Listen for investment changes
      const investmentChannel = supabase
        .channel('wallet-card-investment-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'investments',
            filter: `user_id=eq.${userId}`
          },
          async (payload) => {
            console.log("New investment detected:", payload);
            
            if (payload.new) {
              try {
                // Get project details
                const { data: project } = await supabase
                  .from('projects')
                  .select('name')
                  .eq('id', payload.new.project_id)
                  .single();
                  
                if (project && payload.new.amount) {
                  const amount = typeof payload.new.amount === 'string' 
                    ? parseFloat(payload.new.amount) 
                    : payload.new.amount;
                  notificationService.investmentConfirmed(
                    amount,
                    project.name
                  );
                  setShowRefreshAlert(true);
                }
              } catch (error) {
                console.error("Error getting project details for notification:", error);
              }
            }
          }
        )
        .subscribe();
        
      // Listen for yield payments
      const walletTransactionsChannel = supabase
        .channel('wallet-card-transactions-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'wallet_transactions',
            filter: `user_id=eq.${userId} AND type=eq.deposit`
          },
          async (payload) => {
            console.log("New wallet transaction detected:", payload);
            
            if (payload.new) {
              // Check if it's a yield payment based on description
              if (payload.new.description && 
                  payload.new.description.toLowerCase().includes('rendement') && 
                  payload.new.amount) {
                
                // Extract project name if available
                const projectNameMatch = payload.new.description.match(/du projet (.+)/);
                const projectName = projectNameMatch ? projectNameMatch[1] : 'un projet';
                const amount = typeof payload.new.amount === 'string' 
                  ? parseFloat(payload.new.amount) 
                  : payload.new.amount;
                
                notificationService.yieldReceived(
                  amount,
                  projectName
                );
                setShowRefreshAlert(true);
              }
              // For regular deposits
              else if (payload.new.type === 'deposit' && payload.new.amount) {
                const amount = typeof payload.new.amount === 'string' 
                  ? parseFloat(payload.new.amount) 
                  : payload.new.amount;
                notificationService.depositSuccess(amount);
                setShowRefreshAlert(true);
              }
            }
          }
        )
        .subscribe();
      
      return [withdrawalChannel, bankTransferChannel, investmentChannel, walletTransactionsChannel];
    };
    
    // Set up subscriptions for notifications only
    const subscriptionPromise = setupSubscriptions();
    
    // Initial balance fetch without auto-recalculate
    refreshBalance();
    setLastUpdate(new Date());
    
    return () => {
      subscriptionPromise.then(channels => {
        channels?.forEach(channel => {
          if (channel) supabase.removeChannel(channel);
        });
      });
    };
  }, [refreshBalance]);

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
        
        <div className="flex items-baseline">
          <span className={`text-3xl font-bold ${displayBalance < 0 ? 'text-red-500' : 'text-bgs-blue'}`}>
            {displayBalance.toLocaleString('fr-FR')}
          </span>
          <span className={`ml-1 text-xl ${displayBalance < 0 ? 'text-red-500' : 'text-bgs-blue'}`}>€</span>
        </div>
        
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
