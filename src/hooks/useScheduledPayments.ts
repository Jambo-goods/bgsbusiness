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
          
          try {
            if (payload.eventType === 'UPDATE') {
              const updatedPayment = payload.new as any;
              if (updatedPayment && updatedPayment.id) {
                console.log('Processing UPDATE for payment:', updatedPayment.id);
                
                // Get the project data since it's not included in the payload
                const { data: projectData } = await supabase
                  .from('projects')
                  .select('name, image, status, company_name')
                  .eq('id', updatedPayment.project_id)
                  .single();
                
                // Create a properly typed updated payment with project data
                const fullUpdatedPayment: ScheduledPayment = {
                  ...updatedPayment,
                  status: updatedPayment.status as 'pending' | 'scheduled' | 'paid',
                  projects: projectData || undefined
                };
                
                // Update state with the updated payment
                setScheduledPayments(prevPayments => 
                  prevPayments.map(payment => 
                    payment.id === updatedPayment.id ? fullUpdatedPayment : payment
                  )
                );
                
                // Show notification if payment status changed to paid
                if (fullUpdatedPayment.status === 'paid' && 
                    payload.old && 
                    (payload.old as any).status !== 'paid') {
                  const projectName = fullUpdatedPayment.projects?.name || 'votre projet';
                  toast.success(`Rendement reçu !`, {
                    description: `Vous avez reçu un rendement pour ${projectName}.`,
                    duration: 5000
                  });
                }
              }
            } else if (payload.eventType === 'INSERT') {
              console.log('Processing INSERT for new payment');
              const newPayment = payload.new as any;
              
              // Get the project data since it's not included in the payload
              const { data: projectData } = await supabase
                .from('projects')
                .select('name, image, status, company_name')
                .eq('id', newPayment.project_id)
                .single();
              
              // Create a properly typed new payment with project data
              const fullNewPayment: ScheduledPayment = {
                ...newPayment,
                status: newPayment.status as 'pending' | 'scheduled' | 'paid',
                projects: projectData || undefined
              };
              
              // Add the new payment to state
              setScheduledPayments(prevPayments => [...prevPayments, fullNewPayment]);
            } else if (payload.eventType === 'DELETE') {
              console.log('Processing DELETE for payment');
              const deletedId = (payload.old as any).id;
              if (deletedId) {
                setScheduledPayments(prevPayments => 
                  prevPayments.filter(payment => payment.id !== deletedId)
                );
              }
            }
          } catch (err) {
            console.error('Error processing realtime update:', err);
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
      
    return () => {
      console.log('Cleaning up realtime channel');
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
      
      // Find the current payment to be updated (for UI update before network response)
      const currentPayment = scheduledPayments.find(p => p.id === paymentId);
      if (!currentPayment) {
        throw new Error('Paiement non trouvé');
      }
      
      // Immediately update the UI with the new status for better UX
      setScheduledPayments(prev => 
        prev.map(payment => {
          if (payment.id === paymentId) {
            return { 
              ...payment, 
              ...updateData,
              // Keep the current payment's projects data
              projects: payment.projects
            } as ScheduledPayment;
          }
          return payment;
        })
      );
      
      // Then make the actual API call
      const { data, error } = await supabase
        .from('scheduled_payments')
        .update(updateData)
        .eq('id', paymentId)
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
        console.error('Error updating payment status:', error);
        
        // Revert the optimistic update if there was an error
        setScheduledPayments(prev => [...prev]);
        throw error;
      }

      toast.success(`Statut du paiement mis à jour: ${newStatus === 'paid' ? 'Payé' : newStatus === 'pending' ? 'En attente' : 'Programmé'}`);
      console.log('Payment updated successfully:', data);
      
      // Note: We already updated the UI optimistically, but we'll update with the server data to be safe
      if (data && data.length > 0) {
        // Ensure correct typing for the updated payment data
        const typedData = data.map(payment => ({
          ...payment,
          status: (payment.status as 'pending' | 'scheduled' | 'paid') || 'pending'
        }));
        
        setScheduledPayments(prev => 
          prev.map(payment => 
            payment.id === paymentId ? typedData[0] : payment
          )
        );
      }
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
