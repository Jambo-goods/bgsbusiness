
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
        console.log("useWalletBalance: User ID set to", data.session.user.id);
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
      
      // Direct query to get the latest balance - avoid caching issues
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', data.session.user.id)
        .single();
        
      if (fetchError) {
        console.error("Error fetching wallet balance:", fetchError);
        setError("Erreur lors de la récupération du solde");
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

  // Initial balance fetch
  useEffect(() => {
    if (userId) {
      console.log("Initializing balance fetch for user:", userId);
      fetchWalletBalance(true);
    }
  }, [userId, fetchWalletBalance]);
  
  // Set up realtime subscription for wallet_transactions
  useEffect(() => {
    if (!userId) return;
    
    console.log("Setting up wallet transaction subscriptions for user:", userId);
    
    // Subscribe to wallet transactions to catch deposit confirmations
    const txSubscription = supabase
      .channel('wallet_transactions_balance_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${userId}` }, 
        payload => {
          console.log("Wallet transaction detected:", payload);
          // Force refresh when a transaction affects wallet
          fetchWalletBalance(false);
        }
      )
      .subscribe();
    
    // Subscribe to direct profile updates (wallet_balance field)
    const profileSubscription = supabase
      .channel('profile_balance_changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, 
        payload => {
          console.log("Profile updated for balance:", payload);
          
          if (payload.new && payload.old && 
              typeof payload.new.wallet_balance === 'number' && 
              payload.new.wallet_balance !== payload.old.wallet_balance) {
            
            console.log(`Balance changed from ${payload.old.wallet_balance} to ${payload.new.wallet_balance}`);
            setWalletBalance(payload.new.wallet_balance);
            
            // If balance increased, show toast notification
            const difference = payload.new.wallet_balance - payload.old.wallet_balance;
            if (difference > 0) {
              toast.success(`Votre solde a été crédité de ${difference}€`);
            }
          }
        }
      )
      .subscribe();
    
    // Subscribe to bank transfers - these may trigger wallet balance updates
    const bankTransferSubscription = supabase
      .channel('bank_transfers_for_balance')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bank_transfers', filter: `user_id=eq.${userId}` }, 
        payload => {
          console.log("Bank transfer change detected:", payload);
          // Refresh balance on any bank transfer change
          fetchWalletBalance(false);
        }
      )
      .subscribe();
    
    return () => {
      console.log("Cleaning up wallet balance subscriptions");
      supabase.removeChannel(txSubscription);
      supabase.removeChannel(profileSubscription);
      supabase.removeChannel(bankTransferSubscription);
    };
  }, [userId, fetchWalletBalance]);
  
  // Set up aggressive polling to check balance frequently
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      fetchWalletBalance(false); // Silent refresh
    }, 3000); // Check every 3 seconds
    
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
