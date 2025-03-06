
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionOptions {
  userId: string;
  onProfileUpdate?: () => void;
  onInvestmentUpdate?: () => void;
  onTransactionUpdate?: () => void;
}

export const useRealTimeSubscriptions = ({
  userId,
  onProfileUpdate,
  onInvestmentUpdate,
  onTransactionUpdate
}: SubscriptionOptions) => {
  const [realTimeStatus, setRealTimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    if (!userId) {
      console.log("No user ID provided for real-time subscriptions");
      return;
    }
    
    console.log("Setting up real-time subscriptions for user dashboard with ID:", userId);
    
    // Profile changes (wallet balance, investment total, etc.)
    const profilesChannel = supabase
      .channel('dashboard_profile_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      }, (payload) => {
        console.log('Profile data changed, refreshing dashboard...', payload);
        if (onProfileUpdate) onProfileUpdate();
        toast.info("Mise à jour du profil", {
          description: "Vos informations ont été mises à jour."
        });
      })
      .subscribe((status) => {
        console.log('Profile subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setRealTimeStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          setRealTimeStatus('error');
          console.error('Error subscribing to profile changes');
        }
      });
    
    // Investments changes
    const investmentsChannel = supabase
      .channel('dashboard_investments_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('Investment data changed, refreshing dashboard...', payload);
        if (onInvestmentUpdate) onInvestmentUpdate();
        toast.info("Mise à jour des investissements", {
          description: "Vos investissements ont été mis à jour."
        });
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to investment changes');
        }
      });
    
    // Wallet transactions
    const transactionsChannel = supabase
      .channel('dashboard_transactions_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wallet_transactions',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('Wallet transaction detected, refreshing dashboard...', payload);
        if (onTransactionUpdate) onTransactionUpdate();
        toast.info("Transaction détectée", {
          description: "Votre solde a été mis à jour."
        });
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to transaction changes');
        }
      });
      
    return () => {
      console.log('Cleaning up dashboard real-time subscriptions');
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(investmentsChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [userId, onProfileUpdate, onInvestmentUpdate, onTransactionUpdate]);

  return { realTimeStatus };
};
