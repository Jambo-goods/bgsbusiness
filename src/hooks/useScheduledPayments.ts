
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ScheduledPayment {
  id: string;
  project_id: string;
  payment_date: string;
  status: 'pending' | 'scheduled' | 'paid';
  percentage: number;
  total_scheduled_amount: number | null;
  investors_count: number | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  total_invested_amount: number | null;
  projects?: {
    name: string;
    image: string;
    status: string;
    company_name: string;
  };
}

export const useScheduledPayments = () => {
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduledPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('scheduled_payments')
        .select(`
          *,
          projects (
            name,
            image,
            status,
            company_name
          )
        `)
        .order('payment_date', { ascending: true });

      if (error) {
        console.error('Error fetching scheduled payments:', error);
        setError('Erreur lors de la récupération des paiements programmés');
        return;
      }

      setScheduledPayments(data || []);
    } catch (err: any) {
      console.error('Error in useScheduledPayments:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to realtime updates for scheduled payments
  useEffect(() => {
    fetchScheduledPayments();
    
    const channel = supabase
      .channel('scheduled-payments-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'scheduled_payments' },
        (payload) => {
          console.log('Scheduled payment change detected:', payload);
          
          // If a payment status changed to "paid", show a notification
          if (payload.new?.status === 'paid' && payload.old?.status !== 'paid') {
            // Get project name if available
            const projectName = scheduledPayments.find(p => p.id === payload.new.id)?.projects?.name || 'votre projet';
            
            toast.success(`Rendement reçu !`, {
              description: `Vous avez reçu un rendement pour ${projectName}.`,
              duration: 5000
            });
          }
          
          fetchScheduledPayments();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    scheduledPayments,
    isLoading,
    error,
    refetch: fetchScheduledPayments
  };
};
