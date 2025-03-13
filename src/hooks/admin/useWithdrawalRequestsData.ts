
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  bank_info: any;
  notes: string | null;
  requested_at: string | null;
  processed_at: string | null;
  admin_id: string | null;
}

export const useWithdrawalRequestsData = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchWithdrawals();
    
    // Rafraîchir les données toutes les 60 secondes
    const interval = setInterval(() => {
      fetchWithdrawals();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching withdrawal requests data...");
      
      const { data, error, count } = await supabase
        .from('withdrawal_requests')
        .select('*', { count: 'exact' })
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error fetching withdrawal requests:', error);
        toast.error('Erreur lors du chargement des demandes de retrait');
        return;
      }

      console.log('Withdrawal requests fetched successfully:', data);
      console.log('Total withdrawal requests count:', count);
      
      setWithdrawals(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      toast.error('Erreur lors du chargement des demandes de retrait');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    withdrawals,
    isLoading,
    totalCount,
    refreshWithdrawals: fetchWithdrawals
  };
};
