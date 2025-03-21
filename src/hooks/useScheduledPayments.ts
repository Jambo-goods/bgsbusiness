
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

      // Map the data to ensure status is one of the valid types
      const typedData = (data || []).map(payment => ({
        ...payment,
        status: (payment.status as 'pending' | 'scheduled' | 'paid') || 'pending',
        payment_date: payment.payment_date || new Date().toISOString() // Ensure payment_date is never null
      }));

      setScheduledPayments(typedData);
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
          
          // Fix the TypeScript errors by properly typing and checking payload
          if (payload.new && 
              typeof payload.new === 'object' && 
              'status' in payload.new && 
              payload.old && 
              typeof payload.old === 'object' && 
              'status' in payload.old) {
            
            // If a payment status changed to "paid", show a notification
            if (payload.new.status === 'paid' && payload.old.status !== 'paid') {
              // Get project name if available
              const paymentId = 'id' in payload.new ? payload.new.id : undefined;
              if (paymentId) {
                const payment = scheduledPayments.find(p => p.id === paymentId);
                const projectName = payment?.projects?.name || 'votre projet';
                
                toast.success(`Rendement reçu !`, {
                  description: `Vous avez reçu un rendement pour ${projectName}.`,
                  duration: 5000
                });
              }
            }
          }
          
          fetchScheduledPayments();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Function to add a new scheduled payment
  const addScheduledPayment = async (newPayment: Omit<ScheduledPayment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Ensure payment_date is provided and is a valid date
      if (!newPayment.payment_date) {
        throw new Error('La date de paiement est obligatoire');
      }
      
      // Try to convert to a date object to validate format
      const paymentDate = new Date(newPayment.payment_date);
      if (isNaN(paymentDate.getTime())) {
        throw new Error('La date de paiement est invalide');
      }
      
      // Make sure we're not sending 'notes' field which doesn't exist in the database
      // Remove any fields not in the schema
      const { 
        project_id, 
        payment_date, 
        status, 
        percentage,
        total_invested_amount,
        total_scheduled_amount,
        investors_count
      } = newPayment;
      
      const { data, error } = await supabase
        .from('scheduled_payments')
        .insert({
          project_id,
          payment_date: paymentDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
          status,
          percentage,
          total_invested_amount,
          total_scheduled_amount,
          investors_count
        })
        .select();

      if (error) {
        console.error('Error adding scheduled payment:', error);
        throw error;
      }

      toast.success('Paiement programmé avec succès');
      await fetchScheduledPayments();
      return data;
    } catch (err: any) {
      console.error('Error in addScheduledPayment:', err);
      toast.error(`Erreur: ${err.message || 'Une erreur est survenue'}`);
      throw err;
    }
  };

  // Function to update a scheduled payment status
  const updatePaymentStatus = async (
    paymentId: string, 
    newStatus: 'pending' | 'scheduled' | 'paid',
    newPaymentDate?: string,
    newPercentage?: number
  ) => {
    try {
      // Prepare update object
      const updateData: {
        status: string;
        processed_at?: string | null;
        payment_date?: string;
        percentage?: number;
      } = { 
        status: newStatus,
        processed_at: newStatus === 'paid' ? new Date().toISOString() : null 
      };
      
      // Add optional fields if provided
      if (newPaymentDate) {
        const parsedDate = new Date(newPaymentDate);
        if (!isNaN(parsedDate.getTime())) {
          updateData.payment_date = parsedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }
      }
      
      if (newPercentage !== undefined) {
        updateData.percentage = newPercentage;
      }
      
      const { error } = await supabase
        .from('scheduled_payments')
        .update(updateData)
        .eq('id', paymentId);

      if (error) {
        console.error('Error updating payment status:', error);
        throw error;
      }

      toast.success(`Statut du paiement mis à jour: ${newStatus}`);
      await fetchScheduledPayments();
    } catch (err: any) {
      console.error('Error in updatePaymentStatus:', err);
      toast.error(`Erreur: ${err.message || 'Une erreur est survenue'}`);
      throw err;
    }
  };

  return {
    scheduledPayments,
    isLoading,
    error,
    refetch: fetchScheduledPayments,
    addScheduledPayment,
    updatePaymentStatus
  };
};

export default useScheduledPayments;
