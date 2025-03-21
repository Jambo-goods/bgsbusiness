
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useWalletBalance() {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

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
      
      // Fetch the fresh wallet balance directly from profiles table
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
        if (typeof profileData?.wallet_balance === 'number') {
          setWalletBalance(profileData.wallet_balance);
        } else {
          setWalletBalance(0);
        }
      }
      
      // Update last refresh time
      setLastRefreshTime(Date.now());
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
            if (payload.new && typeof payload.new.wallet_balance === 'number') {
              setWalletBalance(payload.new.wallet_balance);
              
              // If balance increased, show toast notification
              if (payload.old && payload.new.wallet_balance > payload.old.wallet_balance) {
                const difference = payload.new.wallet_balance - payload.old.wallet_balance;
                toast.success(`Votre solde a été crédité de ${difference}€`);
              }
            }
            
            // Force a refresh to ensure data consistency
            setTimeout(() => fetchWalletBalance(false), 500);
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
            
            // Force a refresh regardless of the transaction type to ensure we have latest data
            fetchWalletBalance(false);
            
            // Show notification for completed deposits
            if (payload.new && 
                payload.new.status === 'completed' && 
                payload.new.type === 'deposit' &&
                (!payload.old || payload.old.status !== 'completed')) {
              toast.success(`Dépôt de ${payload.new.amount}€ confirmé`);
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
            
            // Force a refresh regardless of the status change
            fetchWalletBalance(false);
            
            // Show notification for completed transfers
            if (payload.new && 
                (payload.new.status === 'completed' || payload.new.status === 'received') &&
                (!payload.old || (payload.old.status !== 'completed' && payload.old.status !== 'received'))) {
              toast.success(`Virement de ${payload.new.amount}€ confirmé`);
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
  
  // Set up very aggressive polling to check balance every 3 seconds as a fallback
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      // Only refresh if last refresh was more than 2 seconds ago
      // This prevents too many concurrent requests
      if (Date.now() - lastRefreshTime > 2000) {
        fetchWalletBalance(false); // Don't show loading state for automatic updates
      }
    }, 3000);
    
    return () => {
      clearInterval(pollingInterval);
    };
  }, [fetchWalletBalance, lastRefreshTime]);

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
