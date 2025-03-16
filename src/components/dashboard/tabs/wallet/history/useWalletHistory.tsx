
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HistoryItemType, TransactionItem, NotificationItem } from "./HistoryItem";

export default function useWalletHistory() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [combinedItems, setCombinedItems] = useState<HistoryItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        setError("Veuillez vous connecter pour voir votre historique");
        return;
      }

      // Récupération des transactions de l'utilisateur connecté
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false })
        .limit(15);

      if (transactionsError) throw transactionsError;
      
      // Récupération des notifications liées aux retraits
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.session.user.id)
        .eq('type', 'withdrawal')
        .order('created_at', { ascending: false })
        .limit(15);
        
      if (notificationsError) throw notificationsError;
      
      console.log("Notifications récupérées:", notificationsData);
      
      // Convert database types to our interface types
      const typedTransactions = transactionsData?.map(item => ({
        ...item,
        type: item.type as 'deposit' | 'withdrawal',
        itemType: 'transaction' as const
      })) || [];
      
      // Convert notifications to match our Notification interface
      const typedNotifications = notificationsData?.map(item => ({
        id: item.id,
        title: item.title,
        description: item.message,
        created_at: item.created_at,
        type: item.type,
        read: item.seen,
        category: item.category || 'info',
        metadata: item.data as { amount: number; status: string } | null,
        itemType: 'notification' as const
      })) || [];
      
      setTransactions(typedTransactions);
      setNotifications(typedNotifications);
      
      // Combiner et trier les transactions et notifications par date
      const combined = [
        ...typedTransactions,
        ...typedNotifications
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setCombinedItems(combined);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err);
      setError("Erreur lors du chargement de l'historique");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Setup polling for transactions every 60 seconds
    const pollingInterval = setInterval(() => {
      fetchData(false); // silent refresh (don't show loading state)
    }, 60000);
    
    return () => {
      clearInterval(pollingInterval);
    };
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(false);
  };

  return {
    combinedItems,
    isLoading,
    isRefreshing,
    error,
    handleRefresh
  };
}
