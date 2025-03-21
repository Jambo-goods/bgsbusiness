
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      
      console.log("Fetching wallet balance for user:", data.session.user.id);
      
      // Fetch the fresh wallet balance
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', data.session.user.id)
        .single();
        
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
      console.log("Setting up wallet balance subscriptions for user:", userId);
      
      // Subscribe to direct profile updates (wallet_balance field)
      const profileSubscription = supabase
        .channel('wallet_balance_profile_changes')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, 
          payload => {
            console.log("Profile updated for balance:", payload);
            if (payload.new && payload.new.wallet_balance !== undefined) {
              setWalletBalance(payload.new.wallet_balance);
              
              // If balance increased, show toast notification
              if (payload.old && payload.new.wallet_balance > payload.old.wallet_balance) {
                const difference = payload.new.wallet_balance - payload.old.wallet_balance;
                toast.success(`Votre solde a été crédité de ${difference}€`);
              }
            }
          }
        )
        .subscribe();
        
      // Subscribe to wallet transactions which should trigger balance updates
      const txSubscription = supabase
        .channel('wallet_transaction_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${userId}` }, 
          payload => {
            console.log("Wallet transaction detected:", payload);
            // Specifically check for completed deposits
            if (payload.new && payload.new.status === 'completed' && payload.new.type === 'deposit') {
              console.log("Completed deposit detected, refreshing balance");
              fetchWalletBalance(false);
            }
          }
        )
        .subscribe();
      
      // Subscribe to bank transfers changes which might affect the balance
      const bankTransferSubscription = supabase
        .channel('bank_transfers_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'bank_transfers', filter: `user_id=eq.${userId}` }, 
          payload => {
            console.log("Bank transfer updated:", payload);
            if (payload.new && (payload.new.status === 'completed' || payload.new.status === 'received')) {
              console.log("Bank transfer completed, refreshing balance");
              fetchWalletBalance(false);
            }
          }
        )
        .subscribe();
      
      return () => {
        console.log("Cleaning up wallet balance subscriptions");
        supabase.removeChannel(profileSubscription);
        supabase.removeChannel(txSubscription);
        supabase.removeChannel(bankTransferSubscription);
      };
    }
  }, [userId, fetchWalletBalance]);
  
  // Set up aggressive polling to check balance every 10 seconds as a fallback
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      fetchWalletBalance(false); // Don't show loading state for automatic updates
    }, 10000); // Check every 10 seconds instead of 60 to ensure we catch updates quickly
    
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
