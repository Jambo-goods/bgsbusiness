
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useWalletBalance() {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletBalance = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoadingBalance(true);
      }
      setError(null);
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        setWalletBalance(0);
        setIsLoadingBalance(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', session.session.user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching wallet balance:", error);
        setError("Erreur lors de la récupération du solde");
        setWalletBalance(0);
      } else {
        console.log("Wallet balance updated:", data?.wallet_balance);
        setWalletBalance(data?.wallet_balance || 0);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Une erreur est survenue");
      setWalletBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletBalance();
    
    // Set up polling to check balance every minute
    const pollingInterval = setInterval(() => {
      fetchWalletBalance(false); // Don't show loading state for automatic updates
    }, 60000);
    
    // Subscribe to wallet_transactions table changes for real-time updates
    const channel = supabase
      .channel('wallet-balance-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${supabase.auth.getSession().then(({ data }) => data.session?.user.id)}`
        },
        (payload) => {
          console.log("Profile updated in real-time:", payload);
          if (payload.new && typeof payload.new.wallet_balance === 'number') {
            setWalletBalance(payload.new.wallet_balance);
            toast.success("Votre solde a été mis à jour");
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bank_transfers',
          filter: `user_id=eq.${supabase.auth.getSession().then(({ data }) => data.session?.user.id)}`
        },
        (payload) => {
          console.log("Bank transfer updated in real-time:", payload);
          if (payload.new.status === 'reçu' || payload.new.status === 'completed') {
            fetchWalletBalance(false);
            toast.success("Un transfert bancaire a été confirmé");
          }
        }
      )
      .subscribe();
    
    // Clean up on unmount
    return () => {
      clearInterval(pollingInterval);
      supabase.removeChannel(channel);
    };
  }, [fetchWalletBalance]);

  // Function to manually refresh the balance
  const refreshBalance = async () => {
    await fetchWalletBalance(true);
  };

  return { 
    walletBalance, 
    isLoadingBalance, 
    error,
    refreshBalance 
  };
}
