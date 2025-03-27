
import React, { useEffect } from "react";
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
  // Set up a real-time listener for wallet balance changes
  useEffect(() => {
    // Set up real-time channel for wallet transactions
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      
      const userId = data.session.user.id;
      console.log('Setting up wallet balance change listener for user:', userId);
      
      // Listen to wallet transactions
      const walletTxChannel = supabase
        .channel('wallet-balance-changes-display')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${userId}` },
          async (payload) => {
            console.log('Wallet transaction change detected:', payload);
            if (refreshBalance) {
              await refreshBalance();
              
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
        
      // Also listen to profile updates (wallet_balance field)
      const profileChannel = supabase
        .channel('profile-balance-changes')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
          async (payload) => {
            console.log('Profile update detected:', payload);
            if ((payload.new as any).wallet_balance !== (payload.old as any).wallet_balance) {
              console.log('Wallet balance changed from:', (payload.old as any).wallet_balance, 
                          'to:', (payload.new as any).wallet_balance);
              if (refreshBalance) {
                await refreshBalance();
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("Profile balance changes channel status:", status);
        });
        
      // Listen to scheduled payments with better logging
      const scheduledPaymentsChannel = supabase
        .channel('scheduled-payments-wallet-changes')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'scheduled_payments' },
          async (payload) => {
            console.log('Scheduled payment update detected:', payload);
            // If a payment was marked as paid
            if ((payload.new as any).status === 'paid' && (payload.old as any).status !== 'paid') {
              console.log('Payment marked as paid, refreshing wallet balance');
              if (refreshBalance) {
                await refreshBalance();
                
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
  }, [refreshBalance]);
  
  // Force balance refresh on component mount and periodically
  useEffect(() => {
    if (refreshBalance) {
      // Initial refresh
      refreshBalance();
      
      // Set up periodic refresh
      const refreshInterval = setInterval(() => {
        refreshBalance();
      }, 5000); // Check every 5 seconds
      
      return () => {
        clearInterval(refreshInterval);
      };
    }
  }, [refreshBalance]);
  
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
            {balance?.toLocaleString('fr-FR')} €
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
