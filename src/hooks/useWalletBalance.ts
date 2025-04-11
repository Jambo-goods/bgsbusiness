
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
  }, [refreshBalance]);
  
  return {
    walletBalance,
    isLoadingBalance,
    refreshBalance
  };
}
