
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserBalance = () => {
  const [userBalance, setUserBalance] = useState(0);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const maxAttempts = 3;

  const fetchUserBalance = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        return;
      }
      
      // Create a timeout promise to prevent infinite loading
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error("Fetch timeout")), 10000)
      );
      
      // Race the fetch against a timeout
      const result = await Promise.race([
        supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', session.session.user.id)
          .single(),
        timeoutPromise
      ]);
      
      if ('data' in result && result.data) {
        setUserBalance(result.data.wallet_balance || 0);
        setLoadAttempts(0); // Reset attempts counter on success
      }
    } catch (error) {
      console.error("Error fetching user balance:", error);
      
      // If we haven't reached max attempts, try again
      if (loadAttempts < maxAttempts) {
        setLoadAttempts(prev => prev + 1);
        setTimeout(fetchUserBalance, 2000); // Retry after 2 seconds
        return;
      }
    }
  }, [loadAttempts]);

  useEffect(() => {
    fetchUserBalance();
    
    // Set up real-time subscription for wallet balance
    const setupRealtimeSubscription = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      
      const userId = session.session.user.id;
      
      const channel = supabase
        .channel('wallet-balance-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`
          },
          (payload) => {
            if (payload.new && typeof payload.new.wallet_balance === 'number') {
              setUserBalance(payload.new.wallet_balance);
            }
          }
        )
        .subscribe();
        
      return channel;
    };
    
    const subscriptionPromise = setupRealtimeSubscription();
    
    return () => {
      // Clean up subscription
      subscriptionPromise.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, [fetchUserBalance]);

  return { 
    userBalance, 
    isLoading: false,
    refreshBalance: fetchUserBalance 
  };
};
