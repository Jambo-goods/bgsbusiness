
import { useEffect, useState, useCallback } from 'react';
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

  const fetchScheduledPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching scheduled payments...");
      
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

      console.log(`Fetched ${typedData.length} scheduled payments`);
      setScheduledPayments(typedData);
    } catch (err: any) {
      console.error('Error in useScheduledPayments:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to realtime updates for scheduled payments
  useEffect(() => {
    // First fetch all scheduled payments
    fetchScheduledPayments();
    
    console.log('Setting up realtime channel for scheduled payments');
    
    // Properly typed channel for scheduled payments
    const channel = supabase
      .channel('scheduled-payments-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'scheduled_payments' },
        async (payload) => {
          console.log('Received realtime update for scheduled payments:', payload);
          
          // Always refresh the whole list to avoid any sync issues
          fetchScheduledPayments();
          
          // Call edge function to update wallet balance if payment status changed to paid
          if (payload.eventType === 'UPDATE' && 
              payload.new && 
              (payload.new as any).status === 'paid' && 
              payload.old && 
              (payload.old as any).status !== 'paid') {
            
            console.log('Payment status changed to paid, calling wallet update function');
            try {
              const { data: updateResult, error: edgeFunctionError } = await supabase.functions.invoke(
                'update-wallet-on-payment',
                {
                  body: {
                    record: payload.new,
                    old_record: payload.old
                  }
                }
              );
              
              if (edgeFunctionError) {
                console.error('Error invoking wallet update function:', edgeFunctionError);
              } else {
                console.log('Wallet update function result:', updateResult);
                if (updateResult && updateResult.success) {
                  const projectName = (payload.new as any).project_name || 'votre projet';
                  toast.success(`Rendement reçu !`, {
                    description: `Vous avez reçu un rendement pour ${projectName}.`,
                    duration: 5000
                  });
                }
              }
            } catch (edgeError) {
              console.error('Exception calling wallet update function:', edgeError);
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      console.log('Cleaning up realtime channel');
      supabase.removeChannel(channel);
    };
  }, [fetchScheduledPayments]);

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
      
      // Make sure we're not sending fields that don't exist in the database
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
        .select(`
          *,
          projects (
            name,
            image,
            status,
            company_name
          )
        `);

      if (error) {
        console.error('Error adding scheduled payment:', error);
        throw error;
      }

      toast.success('Paiement programmé avec succès');
      
      // We'll update the state directly (without waiting for the realtime update)
      if (data && data.length > 0) {
        // Ensure correct typing for the new payment data
        const typedData = data.map(payment => ({
          ...payment,
          status: (payment.status as 'pending' | 'scheduled' | 'paid') || 'pending'
        }));
        
        setScheduledPayments(prev => [...prev, ...typedData]);
        console.log('Added new payment to state:', typedData);
      }
      
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
      console.log(`Updating payment ${paymentId} to status ${newStatus}`);
      
      // Prepare update object
      const updateData: {
        status: 'pending' | 'scheduled' | 'paid';
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
      
      // Make the API call to Supabase
      const { error } = await supabase
        .from('scheduled_payments')
        .update(updateData)
        .eq('id', paymentId);

      if (error) {
        console.error('Error updating payment status:', error);
        throw error;
      }

      toast.success(`Statut du paiement mis à jour: ${newStatus === 'paid' ? 'Payé' : newStatus === 'pending' ? 'En attente' : 'Programmé'}`);
      
      // Immediately refresh the payments list after the update
      await fetchScheduledPayments();
      
      return true;
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
