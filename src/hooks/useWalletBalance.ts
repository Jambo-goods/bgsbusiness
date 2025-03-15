
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useWalletBalance() {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

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
      
      console.log("Fetching wallet balance for user:", session.session.user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', session.session.user.id)
        .single();
        
      if (error) {
        console.error("Error fetching wallet balance:", error);
        setError("Erreur lors de la récupération du solde");
        setWalletBalance(0);
      } else {
        console.log("Wallet balance fetched:", data?.wallet_balance);
        setWalletBalance(data?.wallet_balance || 0);
        
        // Show a toast when balance updates if we're not in initial loading
        if (!showLoading && lastRefreshed.getTime() > 0) {
          toast.info("Solde du portefeuille mis à jour");
        }
      }
      
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Error:", err);
      setError("Une erreur est survenue");
      setWalletBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [lastRefreshed]);

  // Set up initial fetch and polling
  useEffect(() => {
    fetchWalletBalance();
    
    // Set up polling to check balance every 20 seconds
    const pollingInterval = setInterval(() => {
      fetchWalletBalance(false); // Don't show loading state for automatic updates
    }, 20000);
    
    // Set up real-time subscription for wallet balance changes
    const setupRealtimeSubscription = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      
      console.log("Setting up real-time subscription for profile changes");
      
      const channel = supabase
        .channel('profile_changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.session.user.id}`
        }, (payload) => {
          console.log("Profile updated in real-time:", payload);
          // Update wallet balance when profile is updated
          if (payload.new && 'wallet_balance' in payload.new) {
            console.log("Updating wallet balance from real-time update:", payload.new.wallet_balance);
            setWalletBalance(payload.new.wallet_balance || 0);
            toast.success("Votre solde a été mis à jour");
          }
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    };
    
    const cleanupSubscription = setupRealtimeSubscription();
    
    // Clean up interval and subscription on unmount
    return () => {
      clearInterval(pollingInterval);
      if (cleanupSubscription) {
        cleanupSubscription.then(cleanup => {
          if (cleanup) cleanup();
        });
      }
    };
  }, [fetchWalletBalance]);

  // Function to manually refresh the balance
  const refreshBalance = async () => {
    console.log("Manual wallet balance refresh requested");
    await fetchWalletBalance(true);
  };

  return { 
    walletBalance, 
    isLoadingBalance, 
    error,
    lastRefreshed,
    refreshBalance 
  };
}
