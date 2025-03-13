
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  status: string;
  description: string | null;
  created_at: string | null;
  receipt_confirmed: boolean | null;
}

export const useWalletTransactionsData = () => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchTransactions();
    
    // Rafraîchir les données toutes les 60 secondes
    const interval = setInterval(() => {
      fetchTransactions();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching wallet transactions data...");
      
      const { data, error, count } = await supabase
        .from('wallet_transactions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wallet transactions:', error);
        toast.error('Erreur lors du chargement des transactions');
        return;
      }

      console.log('Wallet transactions fetched successfully:', data);
      console.log('Total wallet transactions count:', count);
      
      setTransactions(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      toast.error('Erreur lors du chargement des transactions');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    transactions,
    isLoading,
    totalCount,
    refreshTransactions: fetchTransactions
  };
};
