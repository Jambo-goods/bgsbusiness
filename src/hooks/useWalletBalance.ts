
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
        setWalletBalance(0);
      } else {
        setWalletBalance(data?.wallet_balance || 0);
      }
    } catch (error) {
      console.error("Error:", error);
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
    
    // Clean up interval on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, [fetchWalletBalance]);

  // Function to manually refresh the balance
  const refreshBalance = async () => {
    await fetchWalletBalance(true);
    toast.success("Solde mis à jour");
  };

  return { walletBalance, isLoadingBalance, refreshBalance };
}
