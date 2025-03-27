
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
  
  // Set up realtime subscription for wallet_transactions and scheduled_payments
  useEffect(() => {
    if (!userId) return;
    
    console.log("Setting up real-time subscriptions for user:", userId);
    
    // Subscribe to wallet transactions to catch direct wallet updates
    const txSubscription = supabase
      .channel('wallet_balance_transactions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${userId}` }, 
        payload => {
          console.log("Wallet transaction detected:", payload);
          // Force refresh when a transaction affects wallet
          fetchWalletBalance(false);
          
          // Show toast for yield transactions
          if (payload.new && payload.eventType === 'INSERT' && 
              (payload.new as any).type === 'yield' && 
              (payload.new as any).status === 'completed') {
            toast.success("Rendement reçu", {
              description: `Votre portefeuille a été crédité de ${(payload.new as any).amount}€`
            });
          }
        }
      )
      .subscribe();
    
    // Subscribe to direct profile updates (wallet_balance field)
    const profileSubscription = supabase
      .channel('wallet_balance_profile')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, 
        payload => {
          console.log("Profile updated for balance:", payload);
          
          if (payload.new && payload.old && 
              typeof (payload.new as any).wallet_balance === 'number' && 
              (payload.new as any).wallet_balance !== (payload.old as any).wallet_balance) {
            
            console.log(`Balance changed from ${(payload.old as any).wallet_balance} to ${(payload.new as any).wallet_balance}`);
            setWalletBalance((payload.new as any).wallet_balance);
            
            // Show toast when balance increases
            if ((payload.new as any).wallet_balance > (payload.old as any).wallet_balance) {
              const difference = (payload.new as any).wallet_balance - (payload.old as any).wallet_balance;
              toast.success("Solde mis à jour", {
                description: `Votre solde a été augmenté de ${difference}€`
              });
            }
          }
        }
      )
      .subscribe();
    
    // Subscribe to scheduled payments to update balance when payments are marked as paid
    const scheduledPaymentsSubscription = supabase
      .channel('wallet_balance_scheduled_payments')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'scheduled_payments' }, 
        payload => {
          // If status changed to 'paid', refresh the balance
          if ((payload.new as any).status === 'paid' && (payload.old as any).status !== 'paid') {
            console.log("Payment status changed to paid, refreshing balance");
            fetchWalletBalance(false);
            
            // Also show a toast notification about the successful payment
            toast.success("Paiement programmé exécuté", {
              description: "Votre solde a été mis à jour"
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      console.log("Cleaning up wallet balance subscriptions");
      supabase.removeChannel(txSubscription);
      supabase.removeChannel(profileSubscription);
      supabase.removeChannel(scheduledPaymentsSubscription);
    };
  }, [userId, fetchWalletBalance]);
  
  // Set up aggressive polling to check balance frequently
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      if (userId) {
        console.log("Polling wallet balance");
        fetchWalletBalance(false); // Silent refresh
      }
    }, 3000); // Check every 3 seconds
    
    return () => {
      clearInterval(pollingInterval);
    };
  }, [userId, fetchWalletBalance]);

  // Function to manually refresh the balance
  const refreshBalance = async (showLoading = true) => {
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
