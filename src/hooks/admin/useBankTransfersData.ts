
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BankTransfer {
  id: string;
  user_id: string;
  amount: number | null;
  reference: string;
  status: string | null;
  notes: string | null;
  processed: boolean | null;
  processed_at: string | null;
  confirmed_at: string | null;
}

export const useBankTransfersData = () => {
  const [transfers, setTransfers] = useState<BankTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchTransfers();
    
    // Rafraîchir les données toutes les 60 secondes
    const interval = setInterval(() => {
      fetchTransfers();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchTransfers = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching bank transfers data...");
      
      const { data, error, count } = await supabase
        .from('bank_transfers')
        .select('*', { count: 'exact' })
        .order('confirmed_at', { ascending: false });

      if (error) {
        console.error('Error fetching bank transfers:', error);
        toast.error('Erreur lors du chargement des virements bancaires');
        return;
      }

      console.log('Bank transfers fetched successfully:', data);
      console.log('Total bank transfers count:', count);
      
      setTransfers(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching bank transfers:', error);
      toast.error('Erreur lors du chargement des virements bancaires');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    transfers,
    isLoading,
    totalCount,
    refreshTransfers: fetchTransfers
  };
};
