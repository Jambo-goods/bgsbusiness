
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useWalletBalance() {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get the current user's ID when the hook loads
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.id) {
        setUserId(data.session.user.id);
      }
    };
    getUser();
  }, []);

  const fetchWalletBalance = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoadingBalance(true);
      }
      setError(null);
      
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        setWalletBalance(0);
        setIsLoadingBalance(false);
        return;
      }
      
      // Force a fresh fetch by adding a cache-busting parameter
      const timestamp = new Date().getTime();
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', data.session.user.id)
        .maybeSingle();
        
      if (fetchError) {
        console.error("Error fetching wallet balance:", fetchError);
        setError("Erreur lors de la récupération du solde");
        setWalletBalance(0);
      } else {
        console.log("Fetched wallet balance:", profileData?.wallet_balance);
        setWalletBalance(profileData?.wallet_balance || 0);
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
    
    // Set up realtime subscription for profile changes to reflect wallet balance updates
    if (userId) {
      const subscription = supabase
        .channel('profile_wallet_changes')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, 
          payload => {
            console.log("Profile updated:", payload);
            if (payload.new && payload.new.wallet_balance !== undefined) {
              setWalletBalance(payload.new.wallet_balance);
            }
          }
        )
        .subscribe();
        
      // Also listen for wallet transactions which might indirectly affect balance
      const txSubscription = supabase
        .channel('wallet_tx_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${userId}` }, 
          payload => {
            console.log("Wallet transaction detected:", payload);
            // Refetch balance when new transactions occur
            fetchWalletBalance(false);
          }
        )
        .subscribe();
      
      // Also listen for bank transfers changes which might affect the balance
      const bankTransferSubscription = supabase
        .channel('bank_transfers_changes')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'bank_transfers', filter: `user_id=eq.${userId}` }, 
          payload => {
            console.log("Bank transfer updated:", payload);
            if (payload.new && (payload.new.status === 'completed' || payload.new.status === 'received')) {
              // Immediately refetch the balance when a transfer is completed
              fetchWalletBalance(false);
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(subscription);
        supabase.removeChannel(txSubscription);
        supabase.removeChannel(bankTransferSubscription);
      };
    }
  }, [userId, fetchWalletBalance]);
  
  // Set up polling to check balance every minute as a fallback
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      fetchWalletBalance(false); // Don't show loading state for automatic updates
    }, 60000);
    
    // Clean up interval on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, [fetchWalletBalance]);

  // Function to manually refresh the balance
  const refreshBalance = async (showLoading = true) => {
    await fetchWalletBalance(showLoading);
  };

  return { 
    walletBalance, 
    isLoadingBalance, 
    error,
    refreshBalance 
  };
}
