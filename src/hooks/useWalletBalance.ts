
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useWalletBalance() {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        setIsLoadingBalance(true);
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
        setIsLoadingBalance(false);
      }
    };
    
    fetchWalletBalance();
    
    // Set up real-time subscription for wallet balance updates
    const profileChannel = supabase
      .channel('navbar_wallet_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `wallet_balance=is.not.null`
      }, () => {
        console.log('Profile updated, refreshing wallet balance...');
        fetchWalletBalance();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, []);

  return { walletBalance, isLoadingBalance };
}
