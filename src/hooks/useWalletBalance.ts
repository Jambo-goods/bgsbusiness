
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseWalletBalanceReturn {
  walletBalance: number;
  isLoadingBalance: boolean;
  refreshBalance: (showLoadingState?: boolean) => Promise<void>;
}

export function useWalletBalance(): UseWalletBalanceReturn {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(true);
  
  const refreshBalance = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsLoadingBalance(true);
      }
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.warn("No user session found when refreshing wallet balance");
        return;
      }
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', session.session.user.id)
        .single();
      
      if (error) {
        console.error("Error fetching wallet balance:", error);
        toast.error("Erreur lors de la récupération du solde");
        return;
      }
      
      setWalletBalance(profile?.wallet_balance || 0);
    } catch (err) {
      console.error("Error in refreshBalance:", err);
      toast.error("Erreur lors de l'actualisation du solde");
    } finally {
      setIsLoadingBalance(false);
    }
  }, []);
  
  useEffect(() => {
    refreshBalance();
    
    // Set up real-time subscription for wallet balance changes
    const setupRealtimeSubscription = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      
      const userId = session.session.user.id;
      
      const channel = supabase
        .channel('wallet_balance_changes')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
          (payload) => {
            // Check if wallet_balance field changed
            if ((payload.new as any).wallet_balance !== (payload.old as any).wallet_balance) {
              console.log('Wallet balance changed, updating...', payload.new);
              setWalletBalance((payload.new as any).wallet_balance || 0);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    };
    
    const cleanup = setupRealtimeSubscription();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [refreshBalance]);
  
  return {
    walletBalance,
    isLoadingBalance,
    refreshBalance
  };
}
