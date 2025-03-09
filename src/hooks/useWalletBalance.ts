
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useWalletBalance() {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  const fetchWalletBalance = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoadingBalance(true);
      }
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        setWalletBalance(0);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', session.session.user.id)
        .single();
        
      if (error) {
        console.error("Error fetching wallet balance:", error);
        setWalletBalance(0);
        return;
      }
      
      setWalletBalance(data.wallet_balance || 0);
    } catch (error) {
      console.error("Error:", error);
      setWalletBalance(0);
    } finally {
      if (showLoading) {
        setIsLoadingBalance(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchWalletBalance();
    
    // Set up polling to check balance every minute
    const pollingInterval = setInterval(() => {
      fetchWalletBalance(false); // Don't show loading state for automatic updates
    }, 60000);
    
    // Clean up interval on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, [fetchWalletBalance]);

  // Function to manually refresh the balance
  const refreshBalance = async () => {
    await fetchWalletBalance(false);
  };

  return { walletBalance, isLoadingBalance, refreshBalance };
}
