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
  }, [fetchWalletBalance]);

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
    fetchWalletBalance();
    
    const setupNotificationSubscriptions = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) return [];
      
      console.log("Setting up minimal notification subscriptions for balance updates");
      
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
              }
            }
          }
        )
        .subscribe();
      
      return [profileChannel];
    };
    
    const subscriptionPromise = setupNotificationSubscriptions();
    
    return () => {
      subscriptionPromise.then(channels => {
        channels?.forEach(channel => {
          if (channel) supabase.removeChannel(channel);
        });
      });
    };
  }, [fetchWalletBalance]);

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
