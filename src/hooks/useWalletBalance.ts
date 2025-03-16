import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notificationService } from "@/services/notifications";

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
      
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'recalculate_wallet_balance',
          { user_uuid: session.session.user.id }
        );
        
        if (rpcError) {
          console.error("Error calling RPC function:", rpcError);
          
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
        } else {
          console.log("RPC recalculation successful");
          
          await fetchWalletBalance(false);
          
          toast.success("Solde recalculé avec succès", {
            id: toastId,
            description: `Nouveau solde: ${walletBalance}€`
          });
        }
      } catch (rpcError) {
        console.error("Error recalculating balance:", rpcError);
        toast.error("Erreur lors du recalcul du solde", {
          id: toastId
        });
      }
      
      await fetchWalletBalance(false);
    } catch (err) {
      console.error("Error during recalculation:", err);
      toast.error("Erreur lors du recalcul du solde");
    } finally {
      setIsLoadingBalance(false);
    }
  }, [fetchWalletBalance, walletBalance]);

  const updateBalanceOnWithdrawal = useCallback(async (withdrawalId: string) => {
    try {
      console.log("Updating balance for withdrawal:", withdrawalId);
      
      const toastId = toast.loading("Mise à jour du solde en cours...");
      
      const response = await supabase.functions.invoke('update-wallet-on-withdrawal', {
        body: { withdrawal_id: withdrawalId }
      });
      
      if (response.error) {
        console.error("Error updating balance on withdrawal:", response.error);
        toast.error("Erreur lors de la mise à jour du solde", { id: toastId });
        return;
      }
      
      console.log("Balance updated successfully:", response.data);
      
      await fetchWalletBalance(false);
      
      if (response.data && response.data.new_balance !== undefined) {
        toast.success("Solde mis à jour", {
          id: toastId,
          description: `Nouveau solde: ${response.data.new_balance}€`
        });
      } else {
        toast.success("Opération terminée", { id: toastId });
      }
    } catch (err) {
      console.error("Error during withdrawal balance update:", err);
      toast.error("Erreur lors de la mise à jour du solde");
    }
  }, [fetchWalletBalance]);

  useEffect(() => {
    console.log("Setting up wallet balance subscriptions");
    fetchWalletBalance();
    
    const pollingInterval = setInterval(() => {
      fetchWalletBalance(false);
    }, 60000);
    
    const setupRealtimeSubscriptions = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) return;
      
      console.log("Setting up realtime subscriptions for wallet balance, user:", userId);
      
      const profileChannel = supabase
        .channel('wallet-balance-profile-changes')
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
                
                if (payload.old && typeof payload.old === 'object') {
                  const oldProfile = payload.old as { wallet_balance?: number };
                  if (newProfile.wallet_balance !== oldProfile.wallet_balance) {
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
            }
          }
        )
        .subscribe((status) => {
          console.log("Realtime subscription status for profiles:", status);
        });
      
      const transactionChannel = supabase
        .channel('wallet-transactions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'wallet_transactions',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log("Wallet transaction changed in real-time:", payload);
            
            fetchWalletBalance(false);
            
            if (payload.new && typeof payload.new === 'object') {
              const newTransaction = payload.new as Record<string, any>;
              if (newTransaction.status === 'completed') {
                const type = newTransaction.type;
                const amount = newTransaction.amount;
                
                if (type === 'deposit') {
                  notificationService.depositSuccess(amount);
                } else if (type === 'withdrawal') {
                  notificationService.withdrawalStatus(amount, 'completed');
                }
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("Realtime subscription status for wallet transactions:", status);
        });
      
      const bankTransferChannel = supabase
        .channel('bank-transfers-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bank_transfers',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log("Bank transfer changed in real-time:", payload);
            
            if (payload.new && typeof payload.new === 'object') {
              const newPayload = payload.new as Record<string, any>;
              const oldPayload = payload.old as Record<string, any>;
              const status = newPayload.status;
              
              console.log("Bank transfer status change:", {
                old: oldPayload?.status,
                new: status,
              });
              
              if ((status === 'reçu' || status === 'received') && 
                  oldPayload?.status !== 'reçu' && oldPayload?.status !== 'received') {
                console.log("Transfer status changed to 'received', refreshing balance...");
                
                fetchWalletBalance(false);
                
                if (newPayload.amount) {
                  notificationService.depositSuccess(newPayload.amount);
                  
                  const sendEmailNotification = async () => {
                    try {
                      const { data: sessionData } = await supabase.auth.getSession();
                      if (!sessionData.session) return;
                      
                      const { data: userData } = await supabase
                        .from('profiles')
                        .select('first_name, last_name, email')
                        .eq('id', sessionData.session.user.id)
                        .single();
                        
                      if (userData) {
                        const userName = `${userData.first_name} ${userData.last_name}`;
                        
                        await supabase.functions.invoke('send-user-notification', {
                          body: {
                            userEmail: userData.email,
                            userName,
                            subject: "Dépôt confirmé",
                            eventType: "deposit",
                            data: {
                              amount: newPayload.amount,
                              status: "completed"
                            }
                          }
                        });
                      }
                    } catch (error) {
                      console.error("Error sending deposit notification email:", error);
                    }
                  };
                  
                  sendEmailNotification();
                }
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("Realtime subscription status for bank transfers:", status);
        });
      
      const withdrawalChannel = supabase
        .channel('withdrawal-requests-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
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
              
              if (oldPayload?.status !== status) {
                console.log(`Withdrawal status changed to '${status}', updating balance...`);
                
                if (newPayload.id) {
                  updateBalanceOnWithdrawal(newPayload.id);
                }
                
                if (newPayload.amount) {
                  const statusMapping = {
                    'pending': 'pending',
                    'approved': 'processing',
                    'scheduled': 'processing',
                    'completed': 'completed',
                    'rejected': 'rejected'
                  } as Record<string, 'pending' | 'processing' | 'completed' | 'rejected'>;
                  
                  notificationService.withdrawalStatus(
                    newPayload.amount, 
                    statusMapping[status] || 'processing'
                  );
                  
                  const sendEmailNotification = async () => {
                    try {
                      const { data: sessionData } = await supabase.auth.getSession();
                      if (!sessionData.session) return;
                      
                      const { data: userData } = await supabase
                        .from('profiles')
                        .select('first_name, last_name, email')
                        .eq('id', sessionData.session.user.id)
                        .single();
                        
                      if (userData) {
                        const userName = `${userData.first_name} ${userData.last_name}`;
                        
                        await supabase.functions.invoke('send-user-notification', {
                          body: {
                            userEmail: userData.email,
                            userName,
                            subject: `Retrait ${status === 'completed' ? 'validé' : 'mis à jour'}`,
                            eventType: "withdrawal",
                            data: {
                              amount: newPayload.amount,
                              status: status
                            }
                          }
                        });
                      }
                    } catch (error) {
                      console.error("Error sending withdrawal notification email:", error);
                    }
                  };
                  
                  sendEmailNotification();
                }
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("Realtime subscription status for withdrawal requests:", status);
        });
      
      return [profileChannel, transactionChannel, bankTransferChannel, withdrawalChannel];
    };
    
    const subscriptionPromise = setupRealtimeSubscriptions();
    
    return () => {
      clearInterval(pollingInterval);
      subscriptionPromise.then(channels => {
        channels?.forEach(channel => {
          if (channel) supabase.removeChannel(channel);
        });
      });
    };
  }, [fetchWalletBalance, updateBalanceOnWithdrawal, recalculateBalance]);

  const refreshBalance = async () => {
    await fetchWalletBalance(true);
  };

  return { 
    walletBalance, 
    isLoadingBalance, 
    error,
    refreshBalance,
    recalculateBalance,
    updateBalanceOnWithdrawal
  };
}
