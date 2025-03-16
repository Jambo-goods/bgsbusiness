
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionOptions {
  userId: string;
  onProfileUpdate?: () => void;
  onInvestmentUpdate?: () => void;
  onTransactionUpdate?: () => void;
  onNotificationUpdate?: () => void;
  pollingInterval?: number;
}

export function useRealTimeSubscriptions({
  userId,
  onProfileUpdate,
  onInvestmentUpdate,
  onTransactionUpdate,
  onNotificationUpdate,
  pollingInterval = 60000 // Default to 1 minute
}: SubscriptionOptions) {
  const [pollingStatus, setPollingStatus] = useState<'active' | 'disabled' | 'error'>('disabled');
  const [hasSetupSubscriptions, setHasSetupSubscriptions] = useState(false);
  
  const triggerManualUpdate = useCallback(() => {
    if (onProfileUpdate) onProfileUpdate();
    if (onInvestmentUpdate) onInvestmentUpdate();
    if (onTransactionUpdate) onTransactionUpdate();
    if (onNotificationUpdate) onNotificationUpdate();
  }, [onProfileUpdate, onInvestmentUpdate, onTransactionUpdate, onNotificationUpdate]);

  useEffect(() => {
    // Only set up subscriptions once
    if (userId && !hasSetupSubscriptions) {
      setHasSetupSubscriptions(true);
      console.log("Setting up real-time subscriptions for user:", userId);
      
      try {
        const channels = [];
        
        // Set up profile changes channel
        if (onProfileUpdate) {
          const profileChannel = supabase.channel('profile-changes')
            .on('postgres_changes', {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${userId}`
            }, (payload) => {
              console.log('Profile updated:', payload);
              onProfileUpdate();
            })
            .subscribe();
          
          channels.push(profileChannel);
        }
        
        // Set up investment changes channel
        if (onInvestmentUpdate) {
          const investmentChannel = supabase.channel('investment-changes')
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'investments',
              filter: `user_id=eq.${userId}`
            }, (payload) => {
              console.log('Investment updated:', payload);
              onInvestmentUpdate();
            })
            .subscribe();
          
          channels.push(investmentChannel);
        }
        
        // Set up transaction changes channel
        if (onTransactionUpdate) {
          const transactionChannel = supabase.channel('transaction-changes')
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'wallet_transactions',
              filter: `user_id=eq.${userId}`
            }, (payload) => {
              console.log('Transaction updated:', payload);
              onTransactionUpdate();
            })
            .subscribe();
          
          channels.push(transactionChannel);
        }
        
        // Set up notification changes channel
        if (onNotificationUpdate) {
          const notificationChannel = supabase.channel('notification-changes')
            .on('postgres_changes', {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`
            }, (payload) => {
              console.log('New notification:', payload);
              onNotificationUpdate();
            })
            .subscribe();
          
          channels.push(notificationChannel);
        }
        
        setPollingStatus('active');
        
        return () => {
          console.log("Cleaning up real-time subscriptions");
          channels.forEach(channel => {
            supabase.removeChannel(channel);
          });
        };
      } catch (error) {
        console.error("Error setting up real-time subscriptions:", error);
        setPollingStatus('error');
      }
    }
  }, [userId, onProfileUpdate, onInvestmentUpdate, onTransactionUpdate, onNotificationUpdate, hasSetupSubscriptions]);

  return {
    pollingStatus,
    triggerManualUpdate
  };
}
