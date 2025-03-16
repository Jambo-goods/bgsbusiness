import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useWalletBalance() {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletBalance = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoadingBalance(true);
      }
      setError(null);
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.log("No active session found, setting balance to 0");
        setWalletBalance(0);
        setIsLoadingBalance(false);
        return;
      }
      
      const userId = session.session.user.id;
      console.log("Fetching wallet balance for user:", userId);
      
      // Get the current balance directly from the profile
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching wallet balance:", error);
        setError("Erreur lors de la récupération du solde");
        setWalletBalance(0);
      } else {
        console.log("Wallet balance fetched from profile:", data?.wallet_balance);
        // Convert null or undefined to 0
        const balance = data?.wallet_balance ?? 0;
        setWalletBalance(balance);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Une erreur est survenue");
      setWalletBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  }, []);

  const recalculateBalance = useCallback(async () => {
    try {
      setIsLoadingBalance(true);
      setError(null);
      
      const toastId = toast.loading("Recalcul du solde en cours...");
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.log("No active session found, cannot recalculate");
        setIsLoadingBalance(false);
        toast.error("Aucune session active trouvée", { id: toastId });
        return;
      }
      
      // Call the Supabase Edge Function to recalculate the balance
      try {
        const response = await supabase.functions.invoke('recalculate-wallet-balance');
        
        console.log("Function response:", response);
        
        if (response.error) {
          console.error("Error calling recalculate function:", response.error);
          toast.error("Erreur lors du recalcul du solde", {
            id: toastId,
            description: "Veuillez réessayer plus tard"
          });
          throw response.error;
        }
        
        const data = response.data;
        console.log("Recalculation function returned:", data);
        
        if (data && typeof data.balance === 'number') {
          setWalletBalance(data.balance);
          
          // Determine appropriate toast based on balance
          if (data.balance < 0) {
            toast.warning("Solde recalculé avec succès", {
              id: toastId,
              description: `Attention: Votre solde est négatif (${data.balance}€)`
            });
          } else {
            toast.success("Solde recalculé avec succès", {
              id: toastId,
              description: `Nouveau solde: ${data.balance}€`
            });
          }
        } else {
          toast.error("Erreur lors du recalcul du solde", {
            id: toastId
          });
        }
      } catch (rpcError) {
        console.error("Error recalculating balance:", rpcError);
        toast.error("Erreur lors du recalcul du solde", {
          id: toastId
        });
      }
      
      // Fetch the updated balance
      await fetchWalletBalance(false);
    } catch (err) {
      console.error("Error during recalculation:", err);
      toast.error("Erreur lors du recalcul du solde");
    } finally {
      setIsLoadingBalance(false);
    }
  }, [fetchWalletBalance]);

  const updateBalanceOnWithdrawal = useCallback(async (withdrawalId: string) => {
    try {
      console.log("Updating balance for withdrawal:", withdrawalId);
      
      const response = await supabase.functions.invoke('update-wallet-on-withdrawal', {
        body: { withdrawal_id: withdrawalId }
      });
      
      if (response.error) {
        console.error("Error updating balance on withdrawal:", response.error);
        return;
      }
      
      console.log("Balance updated successfully:", response.data);
      
      // Refresh the balance
      await fetchWalletBalance(false);
      
      if (response.data && response.data.new_balance) {
        // Show toast notification with the new balance
        toast.success("Solde mis à jour", {
          description: `Nouveau solde: ${response.data.new_balance}€`
        });
      }
    } catch (err) {
      console.error("Error during withdrawal balance update:", err);
    }
  }, [fetchWalletBalance]);

  useEffect(() => {
    console.log("Setting up wallet balance subscriptions");
    fetchWalletBalance();
    
    // Set up polling to check balance every minute
    const pollingInterval = setInterval(() => {
      fetchWalletBalance(false); // Don't show loading state for automatic updates
    }, 60000);
    
    // Subscribe to both profiles table and wallet_transactions table changes for real-time updates
    const setupRealtimeSubscriptions = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) return;
      
      console.log("Setting up realtime subscriptions for wallet balance, user:", userId);
      
      const profileChannel = supabase
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
            console.log("Profile updated in real-time:", payload);
            if (payload.new && typeof payload.new === 'object') {
              const newProfile = payload.new as { wallet_balance?: number };
              if (typeof newProfile.wallet_balance === 'number') {
                console.log("Setting new wallet balance from realtime update:", newProfile.wallet_balance);
                setWalletBalance(newProfile.wallet_balance);
                
                if (newProfile.wallet_balance > 0) {
                  toast.success("Votre solde a été mis à jour", {
                    description: `Nouveau solde: ${newProfile.wallet_balance}€`
                  });
                } else if (newProfile.wallet_balance < 0) {
                  toast.warning("Votre solde a été mis à jour", {
                    description: `Attention: Votre solde est négatif (${newProfile.wallet_balance}€)`
                  });
                }
              }
            }
          }
        )
        .subscribe();
      
      // Listen for changes to wallet transactions
      const transactionChannel = supabase
        .channel('wallet-transactions-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'wallet_transactions',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log("Wallet transaction changed in real-time:", payload);
            
            // Refresh balance to make sure it's up-to-date
            fetchWalletBalance(false);
            
            if (payload.new && typeof payload.new === 'object') {
              const newTransaction = payload.new as Record<string, any>;
              if (newTransaction.status === 'completed') {
                const type = newTransaction.type;
                const amount = newTransaction.amount;
                
                if (type === 'deposit') {
                  toast.success("Dépôt complété", {
                    description: `${amount}€ ont été ajoutés à votre solde`
                  });
                } else if (type === 'withdrawal') {
                  toast.info("Retrait complété", {
                    description: `${amount}€ ont été déduits de votre solde`
                  });
                }
              }
            }
          }
        )
        .subscribe();
      
      // Listen for changes to bank transfers
      const bankTransferChannel = supabase
        .channel('bank-transfers-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'bank_transfers',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log("Bank transfer changed in real-time:", payload);
            
            if (payload.new && typeof payload.new === 'object') {
              // Check for status changes, especially to 'reçu' or 'received'
              const newPayload = payload.new as Record<string, any>;
              const oldPayload = payload.old as Record<string, any>;
              const status = newPayload.status;
              
              console.log("Bank transfer status change:", {
                old: oldPayload?.status,
                new: status,
              });
              
              if (status === 'reçu' || status === 'received') {
                console.log("Transfer status changed to 'received', refreshing balance...");
                fetchWalletBalance(false);
                toast.success("Un transfert bancaire a été confirmé");
              }
            }
          }
        )
        .subscribe();
      
      // Listen for changes to withdrawal requests
      const withdrawalChannel = supabase
        .channel('withdrawal-requests-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'withdrawal_requests',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log("Withdrawal request changed in real-time:", payload);
            
            if (payload.new && typeof payload.new === 'object') {
              const newPayload = payload.new as Record<string, any>;
              const oldPayload = payload.old as Record<string, any>;
              const status = newPayload.status;
              
              console.log("Withdrawal request status change:", {
                old: oldPayload?.status,
                new: status,
              });
              
              // If the status changed to approved, completed or scheduled
              if ((status === 'approved' || status === 'completed' || status === 'scheduled') && 
                  oldPayload?.status !== status) {
                
                console.log(`Withdrawal status changed to '${status}', updating balance...`);
                
                // Update the balance immediately via the edge function
                updateBalanceOnWithdrawal(newPayload.id);
                
                toast.info("Une demande de retrait a été traitée", {
                  description: "Votre solde a été mis à jour"
                });
              }
            }
          }
        )
        .subscribe();
      
      return [profileChannel, transactionChannel, bankTransferChannel, withdrawalChannel];
    };
    
    const subscriptionPromise = setupRealtimeSubscriptions();
    
    // Clean up on unmount
    return () => {
      clearInterval(pollingInterval);
      subscriptionPromise.then(channels => {
        channels.forEach(channel => {
          if (channel) supabase.removeChannel(channel);
        });
      });
    };
  }, [fetchWalletBalance, updateBalanceOnWithdrawal]);

  // Function to manually refresh the balance
  const refreshBalance = async () => {
    await fetchWalletBalance(true);
  };

  return { 
    walletBalance, 
    isLoadingBalance, 
    error,
    refreshBalance,
    recalculateBalance 
  };
}
