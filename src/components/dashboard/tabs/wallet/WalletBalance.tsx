
import React, { useEffect, useRef } from "react";
import { WalletCards } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WalletBalanceProps {
  balance: number;
  isLoading?: boolean;
  onTabChange?: (tab: string) => void;
  refreshBalance?: () => Promise<void>;
}

export default function WalletBalance({
  balance,
  isLoading = false,
  onTabChange,
  refreshBalance
}: WalletBalanceProps) {
  // Use ref to track if we've already refreshed to prevent multiple refreshes
  const refreshInProgress = useRef(false);
  const lastRefreshTime = useRef(Date.now());
  const MIN_REFRESH_INTERVAL = 30000; // Increase to 30 seconds between refreshes to prevent continuous updates
  
  const handleRefresh = async () => {
    // Check if refresh is already in progress or if it's too soon after the last refresh
    const currentTime = Date.now();
    if (refreshInProgress.current || (currentTime - lastRefreshTime.current < MIN_REFRESH_INTERVAL)) {
      return;
    }
    
    if (refreshBalance) {
      try {
        refreshInProgress.current = true;
        await refreshBalance();
        lastRefreshTime.current = Date.now();
      } finally {
        refreshInProgress.current = false;
      }
    }
  };
  
  // Set up a real-time listener for wallet balance changes - with much less frequent updates
  useEffect(() => {
    // Only set up real-time once per component instance
    const setupComplete = useRef(false);
    
    if (setupComplete.current) {
      return;
    }
    
    setupComplete.current = true;
    
    // Set up real-time channel for wallet transactions
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      
      const userId = data.session.user.id;
      console.log('Setting up wallet balance change listener for user:', userId);
      
      // Listen to wallet transactions with strong debounce mechanism
      const walletTxChannel = supabase
        .channel('wallet-balance-display-stable-fixed')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${userId}` },
          async (payload) => {
            console.log('Wallet transaction change detected:', payload);
            
            // Only refresh if enough time has passed since last refresh and it's a significant transaction
            const currentTime = Date.now();
            if (currentTime - lastRefreshTime.current >= MIN_REFRESH_INTERVAL && !refreshInProgress.current) {
              if ((payload.new as any).amount > 10) { // Only refresh for significant amounts
                handleRefresh();
                
                // Show toast for yield transactions
                if ((payload.new as any).type === 'yield' && 
                    (payload.new as any).status === 'completed') {
                  toast.success("Rendement reçu !", {
                    description: `Votre portefeuille a été crédité de ${(payload.new as any).amount}€.`
                  });
                }
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("Wallet balance changes display channel status:", status);
        });
        
      return () => {
        supabase.removeChannel(walletTxChannel);
      };
    };
    
    const cleanup = getSession();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, []);
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-2 rounded-lg">
            <WalletCards className="h-5 w-5 text-bgs-blue" />
          </div>
          <h2 className="text-lg font-semibold text-bgs-blue">Solde disponible</h2>
        </div>
      </div>
      
      <div className="mb-4">
        {isLoading ? (
          <Skeleton className="h-9 w-32 bg-gray-200" />
        ) : (
          <div className="flex items-center text-3xl font-bold text-bgs-blue">
            {balance.toLocaleString('fr-FR')} €
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm text-bgs-gray-medium mb-4">
          Votre solde disponible peut être utilisé pour investir dans de nouveaux projets ou être retiré sur votre compte bancaire.
        </p>
        <div className="flex justify-between items-center">
          <button className="text-bgs-blue hover:text-bgs-blue-light text-sm font-medium transition-colors" onClick={() => onTabChange && onTabChange('deposit')}>
            Ajouter des fonds
          </button>
          <button className="text-bgs-orange hover:text-bgs-orange-light text-sm font-medium transition-colors" onClick={() => onTabChange && onTabChange('withdraw')}>
            Effectuer un retrait
          </button>
        </div>
      </div>
    </div>
  );
}
