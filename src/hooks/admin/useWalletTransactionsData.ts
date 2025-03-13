
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWalletTransactionsData = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Format data by adding user_name from profiles
      const formattedData = (data || []).map(tx => ({
        ...tx,
        user_name: tx.profiles ? 
          `${tx.profiles.first_name || ''} ${tx.profiles.last_name || ''}`.trim() || tx.profiles.email : 
          'Utilisateur inconnu'
      }));
      
      setTransactions(formattedData);
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      setIsError(true);
      toast.error('Erreur lors du chargement des transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    isLoading,
    isError,
    refetch: fetchTransactions
  };
};
