
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseTransferSubscriptionsProps {
  refreshData: () => void;
}

export function useTransferSubscriptions({ refreshData }: UseTransferSubscriptionsProps) {
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Handle refresh after status update with debounce
  const handleStatusUpdate = useCallback(() => {
    setLastUpdateTime(Date.now());
    if (refreshData && !isRefreshing) {
      setIsRefreshing(true);
      toast.info("Actualisation des données en cours...");
      
      // Add a slight delay to ensure database operations have completed
      setTimeout(() => {
        refreshData();
        setIsRefreshing(false);
      }, 800);
    }
  }, [refreshData, isRefreshing]);

  // Subscribe to real-time updates on both tables
  useEffect(() => {
    // Subscribe to bank_transfers table
    const bankTransfersSubscription = supabase
      .channel('bank_transfers_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bank_transfers' }, 
        (payload) => {
          console.log('Changement détecté sur bank_transfers via subscription:', payload);
          
          if (!isRefreshing && refreshData) {
            setIsRefreshing(true);
            toast.info("Mise à jour détectée sur bank_transfers, actualisation en cours...");
            
            setTimeout(() => {
              refreshData();
              setIsRefreshing(false);
            }, 800);
          }
        }
      )
      .subscribe();
      
    // Subscribe to wallet_transactions table
    const walletTransactionsSubscription = supabase
      .channel('wallet_transactions_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'wallet_transactions' }, 
        (payload) => {
          console.log('Changement détecté sur wallet_transactions via subscription:', payload);
          
          if (!isRefreshing && refreshData) {
            setIsRefreshing(true);
            toast.info("Mise à jour détectée sur wallet_transactions, actualisation en cours...");
            
            setTimeout(() => {
              refreshData();
              setIsRefreshing(false);
            }, 800);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(bankTransfersSubscription);
      supabase.removeChannel(walletTransactionsSubscription);
    };
  }, [refreshData, isRefreshing]);

  // Force a refresh every 10 seconds to catch any updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (refreshData && !isRefreshing) {
        setIsRefreshing(true);
        refreshData();
        setTimeout(() => {
          setIsRefreshing(false);
        }, 800);
      }
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [refreshData, isRefreshing]);

  // Initial data load
  useEffect(() => {
    if (refreshData) {
      refreshData();
    }
  }, [refreshData]);

  return {
    lastUpdateTime,
    isRefreshing,
    handleStatusUpdate
  };
}
