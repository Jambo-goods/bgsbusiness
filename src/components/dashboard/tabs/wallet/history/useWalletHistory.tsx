
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  description: string;
  date: Date; // This is a Date object, not a string
  type: string;
  read: boolean;
  category: string;
  metadata: Record<string, any>;
  itemType: 'notification';
}

export interface Transaction {
  id: string;
  amount: number;
  created_at: string;
  description: string;
  receipt_confirmed: boolean;
  status: string;
  type: 'deposit' | 'withdrawal' | 'investment';
  user_id: string;
  itemType: 'transaction';
}

export interface CombinedHistoryItem {
  id: string;
  date: Date;
  formattedDate: string;
  source: 'notification' | 'transaction';
  title?: string;
  description: string;
  amount?: number;
  status?: string;
  type?: string;
  category?: string;
  read?: boolean;
  metadata?: Record<string, any>;
}

export function useWalletHistory() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [combinedHistory, setCombinedHistory] = useState<CombinedHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Veuillez vous connecter pour accéder à vos transactions");
        setIsLoading(false);
        return;
      }

      // Fetch notifications
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (notifError) {
        console.error("Error fetching notifications:", notifError);
        throw notifError;
      }

      // Fetch wallet transactions
      const { data: txData, error: txError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (txError) {
        console.error("Error fetching wallet transactions:", txError);
        throw txError;
      }

      // Transform notifications
      const processedNotifications = notifData.map(notif => ({
        id: notif.id,
        title: notif.title,
        description: notif.message,
        date: new Date(notif.created_at), // Create Date object
        created_at: notif.created_at, // Keep the original string for compatibility
        type: notif.type,
        read: notif.seen,
        category: notif.data?.category || 'info',
        metadata: notif.data || {},
        itemType: 'notification' as const
      }));

      // Transform transactions
      const processedTransactions = txData.map(tx => ({
        ...tx,
        itemType: 'transaction' as const
      }));

      // Update state
      setNotifications(processedNotifications);
      setTransactions(processedTransactions);

      // Combine the history items
      const combined = [
        ...processedNotifications.map(notif => ({
          id: notif.id,
          date: notif.date,
          formattedDate: notif.date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          source: 'notification' as const,
          title: notif.title,
          description: notif.description,
          type: notif.type,
          category: notif.category,
          read: notif.read,
          metadata: notif.metadata
        })),
        ...processedTransactions.map(tx => ({
          id: tx.id,
          date: new Date(tx.created_at),
          formattedDate: new Date(tx.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          source: 'transaction' as const,
          description: tx.description || `Transaction: ${tx.type}`,
          amount: tx.amount,
          status: tx.status,
          type: tx.type
        }))
      ].sort((a, b) => b.date.getTime() - a.date.getTime());

      setCombinedHistory(combined);

    } catch (err: any) {
      console.error("Error in useWalletHistory:", err);
      setError(err.message || "Une erreur est survenue lors du chargement de l'historique");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Set up realtime subscriptions
    const notificationsChannel = supabase
      .channel('wallet_history_notifications')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'notifications' }, 
          () => {
            console.log('Notification updated, refreshing wallet history');
            fetchData();
          })
      .subscribe();
      
    const transactionsChannel = supabase
      .channel('wallet_history_transactions')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'wallet_transactions' }, 
          () => {
            console.log('Transaction updated, refreshing wallet history');
            fetchData();
          })
      .subscribe();
      
    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [fetchData]);

  const refreshHistory = () => {
    fetchData();
  };

  return {
    notifications,
    transactions,
    combinedHistory,
    isLoading,
    error,
    refreshHistory
  };
}
