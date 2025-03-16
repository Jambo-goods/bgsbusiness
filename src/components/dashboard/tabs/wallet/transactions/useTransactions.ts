
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Transaction } from "./types";
import { notificationService } from "@/services/notifications";

export function useTransactions(refreshBalance?: () => Promise<void>) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const subscriptionsRef = useRef<any[]>([]);
  const isMountedRef = useRef(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  const fetchTransactions = useCallback(async (showLoading = true) => {
    if (!isMountedRef.current) return;
    
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        // Don't set error if session is not found, just leave transactions empty
        setTransactions([]);
        return;
      }

      const userId = session.session.user.id;
      console.log("Fetching wallet transactions for user:", userId);
      
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        throw transactionsError;
      }
      
      const { data: transfersData, error: transfersError } = await supabase
        .from('bank_transfers')
        .select('*')
        .eq('user_id', userId);
        
      if (transfersError) {
        console.error("Error fetching bank transfers:", transfersError);
        throw transfersError;
      }

      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', userId);
        
      if (withdrawalsError) {
        console.error("Error fetching withdrawal requests:", withdrawalsError);
        throw withdrawalsError;
      }
      
      if (!isMountedRef.current) return;
      
      // Convert transfers and withdrawals to transactions format
      const transfersAsTransactions: Transaction[] = transfersData ? transfersData.map(transfer => {
        let timestamp = transfer.processed_at || transfer.confirmed_at || new Date().toISOString();
        
        return {
          id: transfer.id,
          amount: transfer.amount || 0,
          type: 'deposit' as const,
          description: `Virement bancaire reçu (réf: ${transfer.reference})`,
          created_at: timestamp,
          status: transfer.status === 'received' || transfer.status === 'reçu' ? 'completed' : 'pending',
          raw_timestamp: timestamp
        };
      }) : [];

      // Format withdrawals as transactions
      const withdrawalsAsTransactions: Transaction[] = [];
      if (withdrawalsData) {
        for (const withdrawal of withdrawalsData) {
          let bankInfo: any = {};
          if (typeof withdrawal.bank_info === 'string') {
            try {
              bankInfo = JSON.parse(withdrawal.bank_info);
            } catch (e) {
              console.error("Error parsing bank_info string:", e);
            }
          } else if (withdrawal.bank_info && typeof withdrawal.bank_info === 'object') {
            bankInfo = withdrawal.bank_info;
          }
          
          const bankName = bankInfo?.bankName || 'Votre banque';
          const accountNumber = bankInfo?.accountNumber || '****';
          const lastFour = typeof accountNumber === 'string' ? accountNumber.slice(-4) : '****';
          
          // Add request transaction
          withdrawalsAsTransactions.push({
            id: `${withdrawal.id}-request`,
            amount: withdrawal.amount || 0,
            type: 'withdrawal' as const,
            description: `Demande de retrait vers ${bankName} (${lastFour})`,
            created_at: withdrawal.requested_at || new Date().toISOString(),
            status: withdrawal.status,
            raw_timestamp: withdrawal.requested_at || new Date().toISOString()
          });
          
          // Add confirmation transaction if processed
          if (withdrawal.processed_at) {
            let statusDesc = '';
            
            if (withdrawal.status === 'completed' || withdrawal.status === 'approved') {
              statusDesc = 'Retrait confirmé';
            } else if (withdrawal.status === 'rejected') {
              statusDesc = 'Retrait rejeté';
            } else {
              statusDesc = 'Retrait traité';
            }
            
            withdrawalsAsTransactions.push({
              id: `${withdrawal.id}-confirmation`,
              amount: withdrawal.amount || 0,
              type: 'withdrawal' as const,
              description: `${statusDesc} vers ${bankName} (${lastFour})`,
              created_at: withdrawal.processed_at,
              status: withdrawal.status,
              raw_timestamp: withdrawal.processed_at
            });
          }
        }
      }
      
      // Format regular transactions
      const formattedTransactions: Transaction[] = transactionsData ? transactionsData.map(tx => {
        return {
          id: tx.id,
          amount: tx.amount,
          type: tx.type as 'deposit' | 'withdrawal',
          description: tx.description,
          created_at: tx.created_at,
          status: tx.status,
          raw_timestamp: tx.created_at
        };
      }) : [];
      
      // Combine all transactions and sort by date
      const allTransactions = [...formattedTransactions, ...transfersAsTransactions, ...withdrawalsAsTransactions]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 15);
      
      if (isMountedRef.current) {
        setTransactions(allTransactions);
        setError(null);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des transactions:", err);
      if (isMountedRef.current) {
        setError("Erreur lors du chargement de l'historique des transactions");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  // Set up subscriptions
  useEffect(() => {
    isMountedRef.current = true;
    fetchTransactions();
    
    const setupSubscriptions = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;
        
        if (!userId) {
          setSessionChecked(true);
          return;
        }
        
        console.log("Setting up realtime subscriptions for wallet transactions, user:", userId);
        
        const transactionsChannel = supabase
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
              if (!isMountedRef.current) return;
              
              console.log("Wallet transaction changed in real-time:", payload);
              fetchTransactions(false);
            }
          )
          .subscribe();
        
        subscriptionsRef.current = [transactionsChannel];
        setSessionChecked(true);
      } catch (error) {
        console.error("Error setting up realtime subscriptions:", error);
        setSessionChecked(true);
      }
    };
    
    // Only setup once
    if (!sessionChecked) {
      setupSubscriptions();
    }
    
    return () => {
      isMountedRef.current = false;
      
      if (subscriptionsRef.current.length > 0) {
        subscriptionsRef.current.forEach(channel => {
          if (channel) supabase.removeChannel(channel);
        });
        subscriptionsRef.current = [];
      }
    };
  }, [fetchTransactions, sessionChecked]);

  const handleRefresh = useCallback(() => {
    fetchTransactions(false);
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    isRefreshing,
    handleRefresh
  };
}
