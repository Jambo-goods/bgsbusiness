
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ScheduledPayment {
  id: string;
  project_id: string;
  payment_date: string;
  percentage: number;
  total_scheduled_amount: number;
  investors_count: number;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  total_invested_amount: number;
  status: string;
}

export const useScheduledPaymentsData = () => {
  const [payments, setPayments] = useState<ScheduledPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchScheduledPayments();
    
    // Rafraîchir les données toutes les 60 secondes
    const interval = setInterval(() => {
      fetchScheduledPayments();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchScheduledPayments = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching scheduled payments data...");
      
      const { data, error, count } = await supabase
        .from('scheduled_payments')
        .select('*', { count: 'exact' })
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching scheduled payments:', error);
        toast.error('Erreur lors du chargement des paiements programmés');
        return;
      }

      console.log('Scheduled payments fetched successfully:', data);
      console.log('Total scheduled payments count:', count);
      
      setPayments(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching scheduled payments:', error);
      toast.error('Erreur lors du chargement des paiements programmés');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    payments,
    isLoading,
    totalCount,
    refreshPayments: fetchScheduledPayments
  };
};
