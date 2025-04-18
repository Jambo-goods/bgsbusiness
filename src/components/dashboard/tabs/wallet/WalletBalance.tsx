
import React, { useEffect, useRef } from "react";
import { WalletCards } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  // Use ref to track if we've already refreshed to prevent multiple refreshes
  const refreshInProgress = useRef(false);
  const lastRefreshTime = useRef(Date.now());
  const MIN_REFRESH_INTERVAL = 5000; // Increase to 5 seconds between refreshes
  
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
  
  // Set up a real-time listener for wallet balance changes
  useEffect(() => {
    // Set up real-time channel for wallet transactions
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      
      const userId = data.session.user.id;
      console.log('Setting up wallet balance change listener for user:', userId);
      
      // Listen to wallet transactions with debounce mechanism - use a more selective channel name
      const walletTxChannel = supabase
        .channel('wallet-balance-changes-display-stable')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${userId}` },
          async (payload) => {
            console.log('Wallet transaction change detected:', payload);
            
            // Only refresh if enough time has passed since last refresh
            const currentTime = Date.now();
            if (currentTime - lastRefreshTime.current >= MIN_REFRESH_INTERVAL) {
              handleRefresh();
              
              // Show toast for yield transactions
              if (payload.new && payload.eventType === 'INSERT' && 
                  (payload.new as any).type === 'yield' && 
                  (payload.new as any).status === 'completed') {
                toast.success("Rendement reçu !", {
                  description: `Votre portefeuille a été crédité de ${(payload.new as any).amount}€.`
                });
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("Wallet balance changes display channel status:", status);
        });
        
      // Also listen to profile updates (wallet_balance field) with debounce
      const profileChannel = supabase
        .channel('profile-balance-changes-stable')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
          async (payload) => {
            console.log('Profile update detected:', payload);
            
            // Only refresh if the wallet_balance field actually changed
            if ((payload.new as any).wallet_balance !== (payload.old as any).wallet_balance) {
              console.log('Wallet balance changed from:', (payload.old as any).wallet_balance, 
                          'to:', (payload.new as any).wallet_balance);
              
              // Only refresh if enough time has passed since last refresh
              const currentTime = Date.now();
              if (currentTime - lastRefreshTime.current >= MIN_REFRESH_INTERVAL) {
                handleRefresh();
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("Profile balance changes channel status:", status);
        });
        
      // Listen to scheduled payments with better logging and debounce
      const scheduledPaymentsChannel = supabase
        .channel('scheduled-payments-wallet-changes-stable')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'scheduled_payments' },
          async (payload) => {
            console.log('Scheduled payment update detected:', payload);
            // If a payment was marked as paid
            if ((payload.new as any).status === 'paid' && (payload.old as any).status !== 'paid') {
              console.log('Payment marked as paid, refreshing wallet balance');
              
              // Only refresh if enough time has passed since last refresh
              const currentTime = Date.now();
              if (currentTime - lastRefreshTime.current >= MIN_REFRESH_INTERVAL) {
                handleRefresh();
                
                // Show toast for successful payment
                toast.success("Paiement programmé reçu", {
                  description: "Votre solde a été mis à jour avec le montant du paiement programmé"
                });
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("Scheduled payments wallet changes channel status:", status);
        });
      
      return () => {
        supabase.removeChannel(walletTxChannel);
        supabase.removeChannel(profileChannel);
        supabase.removeChannel(scheduledPaymentsChannel);
      };
    };
    
    const cleanup = getSession();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, []);
  
  // Initial fetch only on mount - do it once and don't set up recurring refreshes
  useEffect(() => {
    if (refreshBalance && !refreshInProgress.current) {
      refreshInProgress.current = true;
      refreshBalance().finally(() => {
        refreshInProgress.current = false;
        lastRefreshTime.current = Date.now();
      });
    }
  }, [refreshBalance]);
  
  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-100 mb-6 hover:shadow-lg transition-all duration-300">
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
          <div className="flex items-center text-2xl md:text-3xl font-bold text-bgs-blue">
            {balance.toLocaleString('fr-FR')} €
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm text-bgs-gray-medium mb-4">
          Votre solde disponible peut être utilisé pour investir dans de nouveaux projets ou être retiré sur votre compte bancaire.
        </p>
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-between items-center'}`}>
          <button className="w-full md:w-auto text-center md:text-left bg-bgs-blue text-white py-2 px-4 rounded-lg hover:bg-bgs-blue-light md:bg-transparent md:text-bgs-blue md:p-0 md:hover:bg-transparent transition-colors" onClick={() => onTabChange && onTabChange('deposit')}>
            Ajouter des fonds
          </button>
          <button className="w-full md:w-auto text-center md:text-left bg-bgs-orange text-white py-2 px-4 rounded-lg hover:bg-bgs-orange-light md:bg-transparent md:text-bgs-orange md:p-0 md:hover:bg-transparent transition-colors" onClick={() => onTabChange && onTabChange('withdraw')}>
            Effectuer un retrait
          </button>
        </div>
      </div>
    </div>
  );
}
