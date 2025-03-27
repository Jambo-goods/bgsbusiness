
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useWalletBalance() {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Add a debounce mechanism
  const refreshTimeoutRef = useRef<number | null>(null);
  const MIN_REFRESH_INTERVAL = 30000; // Increase to 30 seconds between refreshes
  const subscriptionsSet = useRef<boolean>(false);

  // Get the current user's ID when the hook loads
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.id) {
          setUserId(data.session.user.id);
          console.log("useWalletBalance: User ID set to", data.session.user.id);
        } else {
          console.log("useWalletBalance: No user session found");
          setIsLoadingBalance(false); // No user, so we're not loading
        }
      } catch (err) {
        console.error("Error getting user session:", err);
        setIsLoadingBalance(false);
      }
    };
    
    getUser();
  }, []);

  // Debounced refresh function with extra protection
  const debouncedRefresh = useCallback((callback: () => void) => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current !== null) {
      window.clearTimeout(refreshTimeoutRef.current);
    }
    
    // Set a new timeout only if we haven't refreshed recently
    const currentTime = Date.now();
    if (currentTime - lastUpdateTime > MIN_REFRESH_INTERVAL) {
      refreshTimeoutRef.current = window.setTimeout(() => {
        callback();
        refreshTimeoutRef.current = null;
      }, 500); // Small debounce time
    }
  }, [lastUpdateTime]);

  const fetchWalletBalance = useCallback(async (showLoading = true) => {
    // Prevent multiple concurrent refreshes
    if (isRefreshing) return;
    
    try {
      if (showLoading && !initialLoadComplete) {
        setIsLoadingBalance(true);
      }
      setIsRefreshing(true);
      setError(null);
      
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        setWalletBalance(0);
        setIsLoadingBalance(false);
        setIsRefreshing(false);
        setInitialLoadComplete(true);
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
        setLastUpdateTime(Date.now());
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Une erreur est survenue");
      // Don't reset wallet balance on error to prevent flickering
    } finally {
      setIsLoadingBalance(false);
      setIsRefreshing(false);
      setInitialLoadComplete(true);
    }
  }, [isRefreshing, initialLoadComplete]);

  // Initial balance fetch - only happens once when userId is set
  useEffect(() => {
    if (userId) {
      console.log("Initializing balance fetch for user:", userId);
      fetchWalletBalance(true);
    }
  }, [userId, fetchWalletBalance]);
  
  // Set up realtime subscription for wallet_transactions, scheduled_payments and profile updates
  // with improved debounce and stability - only set up once
  useEffect(() => {
    if (!userId || subscriptionsSet.current) return;
    
    console.log("Setting up real-time subscriptions for user:", userId);
    subscriptionsSet.current = true;
    
    // Subscribe to wallet transactions to catch direct wallet updates
    const txSubscription = supabase
      .channel('wallet_balance_transactions_stable_fixed')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${userId}` }, 
        payload => {
          console.log("Wallet transaction detected:", payload);
          
          // Only update if we haven't updated recently and it's a significant amount
          const currentTime = Date.now();
          if (currentTime - lastUpdateTime > MIN_REFRESH_INTERVAL && !isRefreshing) {
            if ((payload.new as any).amount > 10) { // Only refresh for significant amounts
              // Use debounced refresh to prevent multiple rapid updates
              debouncedRefresh(() => fetchWalletBalance(false));
            }
          }
        }
      )
      .subscribe();
    
    // Subscribe to direct profile updates (wallet_balance field) but with stronger limits
    const profileSubscription = supabase
      .channel('wallet_balance_profile_stable_fixed')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, 
        payload => {
          // Only update if the wallet_balance field actually changed by a significant amount
          if (payload.new && payload.old && 
              typeof (payload.new as any).wallet_balance === 'number' && 
              (payload.new as any).wallet_balance !== (payload.old as any).wallet_balance) {
            
            const difference = Math.abs((payload.new as any).wallet_balance - (payload.old as any).wallet_balance);
            
            if (difference > 10) { // Only update for changes greater than 10€
              console.log(`Balance changed significantly from ${(payload.old as any).wallet_balance} to ${(payload.new as any).wallet_balance}`);
              
              // Directly set the balance without triggering a refresh
              // This prevents refresh loops
              setWalletBalance((payload.new as any).wallet_balance);
              setLastUpdateTime(Date.now());
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      console.log("Cleaning up wallet balance subscriptions");
      // Clear any pending timeout
      if (refreshTimeoutRef.current !== null) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
      supabase.removeChannel(txSubscription);
      supabase.removeChannel(profileSubscription);
    };
  }, [userId, fetchWalletBalance, debouncedRefresh, lastUpdateTime, isRefreshing]);

  // Function to manually refresh the balance
  const refreshBalance = async (showLoading = true) => {
    if (isRefreshing) return;
    
    const currentTime = Date.now();
    if (currentTime - lastUpdateTime < MIN_REFRESH_INTERVAL) {
      console.log("Manual refresh requested but skipped due to rate limiting");
      return;
    }
    
    console.log("Manual refresh of wallet balance requested");
    await fetchWalletBalance(showLoading);
  };

  return { 
    walletBalance, 
    isLoadingBalance, 
    error,
    refreshBalance 
  };
}
