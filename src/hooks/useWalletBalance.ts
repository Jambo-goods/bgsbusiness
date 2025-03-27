
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useWalletBalance() {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const fetchWalletBalance = useCallback(async (showLoading = true) => {
    // Prevent multiple concurrent refreshes
    if (isRefreshing) return;
    
    try {
      if (showLoading) {
        setIsLoadingBalance(true);
      }
      setIsRefreshing(true);
      setError(null);
      
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        setWalletBalance(0);
        setIsLoadingBalance(false);
        setIsRefreshing(false);
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
      setWalletBalance(0);
    } finally {
      setIsLoadingBalance(false);
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Initial balance fetch
  useEffect(() => {
    if (userId) {
      console.log("Initializing balance fetch for user:", userId);
      fetchWalletBalance(true);
    }
  }, [userId, fetchWalletBalance]);
  
  // Set up realtime subscription for wallet_transactions, scheduled_payments and profile updates
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
          
          // Show toast for yield/deposit transactions related to project returns
          if (payload.new && payload.eventType === 'INSERT' && 
              (payload.new as any).status === 'completed' &&
              (payload.new as any).description?.includes('Rendement')) {
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
            setLastUpdateTime(Date.now());
            
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
            
            // Process the payment directly
            processScheduledPayment((payload.new as any).id, (payload.new as any).project_id, (payload.new as any).percentage);
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

  // Helper function to directly process a scheduled payment
  const processScheduledPayment = async (paymentId: string, projectId: string, percentage: number) => {
    try {
      console.log(`Directly processing payment ${paymentId} for project ${projectId}`);
      
      const { data: result, error } = await supabase.functions.invoke(
        'update-wallet-on-payment',
        {
          body: {
            paymentId: paymentId,
            projectId: projectId,
            percentage: percentage,
            processAll: true,
            forceRefresh: true
          }
        }
      );
      
      if (error) {
        console.error(`Error processing payment ${paymentId}:`, error);
        toast.error("Erreur lors du traitement du paiement", {
          description: "Veuillez réessayer ou contacter l'administrateur"
        });
      } else {
        console.log(`Successfully processed payment ${paymentId}:`, result);
        
        if (result?.processed > 0) {
          fetchWalletBalance(false);
          
          toast.success("Paiement traité", {
            description: `Votre solde a été mis à jour avec ${result.processed} paiements`
          });
        }
      }
    } catch (err) {
      console.error(`Error invoking edge function:`, err);
      toast.error("Erreur lors de la mise à jour des soldes", {
        description: "Un problème est survenu pendant le traitement"
      });
    }
  };
  
  // Set up polling with a much less frequent interval (2 minutes)
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      if (userId && !isRefreshing) {
        const timeElapsed = Date.now() - lastUpdateTime;
        // Only refresh if it's been more than 2 minutes since the last update
        if (timeElapsed > 120000) {
          console.log("Polling wallet balance");
          fetchWalletBalance(false); // Silent refresh
          
          // Also check for any unprocessed payments that should be paid
          checkUnprocessedPayments();
        }
      }
    }, 120000); // Check every 2 minutes instead of 30 seconds
    
    return () => {
      clearInterval(pollingInterval);
    };
  }, [userId, fetchWalletBalance, lastUpdateTime, isRefreshing]);
  
  // Function to check for any unprocessed payments (new)
  const checkUnprocessedPayments = async () => {
    if (isRefreshing) return;
    
    try {
      // Look for paid payments that haven't been processed yet
      const { data: unprocessedPayments, error } = await supabase
        .from('scheduled_payments')
        .select('id, project_id, percentage')
        .eq('status', 'paid')
        .is('processed_at', null);
        
      if (error) {
        console.error("Error checking for unprocessed payments:", error);
        return;
      }
      
      if (unprocessedPayments && unprocessedPayments.length > 0) {
        console.log(`Found ${unprocessedPayments.length} unprocessed paid payments`);
        
        // Process them one by one
        for (const payment of unprocessedPayments) {
          await processScheduledPayment(payment.id, payment.project_id, payment.percentage);
        }
      }
    } catch (err) {
      console.error("Error checking for unprocessed payments:", err);
    }
  };

  // Function to manually refresh the balance
  const refreshBalance = async (showLoading = true) => {
    if (isRefreshing) return;
    
    console.log("Manual refresh of wallet balance requested");
    await fetchWalletBalance(showLoading);
    
    // Also check for unprocessed payments
    await checkUnprocessedPayments();
  };

  return { 
    walletBalance, 
    isLoadingBalance, 
    error,
    refreshBalance 
  };
}
