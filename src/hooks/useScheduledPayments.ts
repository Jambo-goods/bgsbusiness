
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useScheduledPayments = () => {
  const [scheduledPayments, setScheduledPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get all scheduled payments for all projects
  const fetchScheduledPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('scheduled_payments')
        .select(`
          *,
          projects:project_id (
            name,
            image,
            company_name,
            status
          )
        `)
        .order('payment_date', { ascending: true });

      if (error) {
        console.error('Error fetching scheduled payments:', error);
        setError('Erreur lors de la récupération des paiements programmés');
        return [];
      }

      console.log('Scheduled payments fetched:', data?.length || 0);
      setScheduledPayments(data || []);
      return data || [];
    } catch (err) {
      console.error('Error in fetchScheduledPayments:', err);
      setError('Une erreur est survenue');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new scheduled payment
  const addScheduledPayment = async (paymentData: any) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_payments')
        .insert([paymentData])
        .select();

      if (error) {
        console.error('Error adding scheduled payment:', error);
        throw new Error(error.message);
      }

      // Refresh the payments list
      await fetchScheduledPayments();
      return data;
    } catch (error: any) {
      console.error('Error in addScheduledPayment:', error);
      throw error;
    }
  };

  // Update a payment's status, date, percentage
  const updatePaymentStatus = async (
    paymentId: string,
    newStatus: 'pending' | 'scheduled' | 'paid',
    newDate?: string,
    newPercentage?: number
  ) => {
    try {
      console.log(`Updating payment ${paymentId} to status: ${newStatus}`);
      
      // First refresh to ensure we have the latest data
      await fetchScheduledPayments();
      
      // Find the payment to update
      let paymentToUpdate = scheduledPayments.find(p => p.id === paymentId);
      
      if (!paymentToUpdate) {
        console.log(`Payment ${paymentId} not found in local state, fetching directly`);
        // Fetch the payment directly from the database
        const { data: directPayment, error: fetchError } = await supabase
          .from('scheduled_payments')
          .select('*')
          .eq('id', paymentId)
          .single();
          
        if (fetchError || !directPayment) {
          console.error('Error fetching payment directly:', fetchError);
          throw new Error('Paiement non trouvé');
        }
        
        console.log('Fetched payment directly:', directPayment);
        paymentToUpdate = directPayment;
      }
      
      // Create update object
      const updateObject: any = { status: newStatus };
      if (newDate) updateObject.payment_date = newDate;
      if (newPercentage !== undefined) updateObject.percentage = newPercentage;
      
      // Perform the update
      const { error: updateError } = await supabase
        .from('scheduled_payments')
        .update(updateObject)
        .eq('id', paymentId);

      if (updateError) {
        console.error('Error updating scheduled payment:', updateError);
        throw new Error(updateError.message);
      }
      
      // If status changed to paid, create wallet transactions for all investors
      if (newStatus === 'paid' && paymentToUpdate.status !== 'paid') {
        console.log('Payment marked as paid, processing wallet updates');
        
        try {
          const { error: functionError } = await supabase.functions.invoke(
            'update-wallet-on-payment',
            {
              body: {
                paymentId: paymentId,
                projectId: paymentToUpdate.project_id,
                percentage: newPercentage || paymentToUpdate.percentage
              }
            }
          );
          
          if (functionError) {
            console.error('Error invoking edge function:', functionError);
            // Continue anyway, the UI will be updated via real-time subscription
          } else {
            console.log('Edge function called successfully to update wallet balances');
          }
        } catch (funcError) {
          console.error('Exception invoking edge function:', funcError);
          // Continue anyway
        }
      }

      // Success! Refresh the payments list
      await fetchScheduledPayments();
      
      return true;
    } catch (error: any) {
      console.error('Error in updatePaymentStatus:', error);
      throw error;
    }
  };

  // Refetch data function exposed to components
  const refetch = async () => {
    return fetchScheduledPayments();
  };

  // Initial fetch
  useEffect(() => {
    fetchScheduledPayments();
    
    // Set up real-time listener for scheduled payments table
    const scheduledPaymentsChannel = supabase
      .channel('scheduled_payments_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'scheduled_payments' },
        (payload) => {
          console.log('Real-time update on scheduled payments:', payload);
          fetchScheduledPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(scheduledPaymentsChannel);
    };
  }, [fetchScheduledPayments]);

  return {
    scheduledPayments,
    isLoading,
    error,
    updatePaymentStatus,
    addScheduledPayment,
    refetch
  };
};

export default useScheduledPayments;
