
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export const useScheduledPayments = () => {
  const [scheduledPayments, setScheduledPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Get all scheduled payments for all projects
  const fetchScheduledPayments = useCallback(async (showLoading = true) => {
    try {
      // Only show loading state on initial load
      if (showLoading) {
        setIsLoading(true);
      }
      setIsFetching(true);
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
      if (showLoading) {
        setIsLoading(false);
      }
      setIsFetching(false);
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

      // Refresh the payments list without showing loading
      await fetchScheduledPayments(false);
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
      
      // First refresh to ensure we have the latest data, without showing loading
      await fetchScheduledPayments(false);
      
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
      
      // Check if this is a status change to "paid"
      const changingToPaid = newStatus === 'paid' && paymentToUpdate.status !== 'paid';
      
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
      if (changingToPaid) {
        console.log('Payment marked as paid, processing wallet updates');
        
        try {
          // Get current user information to create notification
          const { data: sessionData } = await supabase.auth.getSession();
          const currentUserId = sessionData?.session?.user?.id;
          
          if (currentUserId) {
            // Create a notification for the payment update
            const { data: projectData } = await supabase
              .from('projects')
              .select('name')
              .eq('id', paymentToUpdate.project_id)
              .single();
              
            if (projectData) {
              // Create notification in database for the user
              const { error: notifError } = await supabase.from('notifications').insert({
                user_id: currentUserId,
                title: "Paiement programmé payé",
                message: `Le paiement programmé pour le projet ${projectData.name} a été marqué comme payé.`,
                type: "payment_update",
                seen: false,
                data: {
                  payment_id: paymentId,
                  project_id: paymentToUpdate.project_id,
                  status: "paid",
                  amount: paymentToUpdate.total_scheduled_amount,
                  category: "success"
                }
              });
              
              if (notifError) {
                console.error("Error creating payment notification:", notifError);
              } else {
                console.log("Created payment status notification successfully");
              }
            }
          }
          
          // Call the edge function to update all investors' wallets with more detailed logging
          console.log('Calling update-wallet-on-payment edge function with these parameters:', {
            paymentId: paymentId,
            projectId: paymentToUpdate.project_id,
            percentage: newPercentage || paymentToUpdate.percentage,
            processAll: true,
            forceRefresh: true 
          });
          
          const { data: functionResult, error: functionError } = await supabase.functions.invoke(
            'update-wallet-on-payment',
            {
              body: {
                paymentId: paymentId,
                projectId: paymentToUpdate.project_id,
                percentage: newPercentage || paymentToUpdate.percentage,
                processAll: true,
                forceRefresh: true
              }
            }
          );
          
          console.log('Edge function response:', functionResult);
          
          if (functionError) {
            console.error('Error invoking edge function:', functionError);
            toast.error("Erreur de mise à jour des soldes", {
              description: "Veuillez contacter l'administrateur"
            });
          } else {
            console.log('Edge function called successfully to update wallet balances');
            // Show a toast notification about the successful payment
            toast.success("Paiement traité avec succès", {
              description: "Le versement a été ajouté aux soldes disponibles"
            });
          }
        } catch (funcError) {
          console.error('Exception invoking edge function:', funcError);
          toast.error("Erreur lors du traitement du paiement");
        }
      }

      // Success! Refresh the payments list without showing loading
      await fetchScheduledPayments(false);
      
      return true;
    } catch (error: any) {
      console.error('Error in updatePaymentStatus:', error);
      throw error;
    }
  };

  // Refetch data function exposed to components
  const refetch = async () => {
    // Don't show loading indicator on manual refetch
    return fetchScheduledPayments(false);
  };

  // Initial fetch
  useEffect(() => {
    fetchScheduledPayments(true);
    
    // Set up real-time listener for scheduled payments table
    const scheduledPaymentsChannel = supabase
      .channel('scheduled_payments_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'scheduled_payments' },
        (payload) => {
          console.log('Real-time update on scheduled payments:', payload);
          // Check if a payment has been marked as paid
          if (payload.eventType === 'UPDATE' && 
              (payload.new as any).status === 'paid' && 
              (payload.old as any).status !== 'paid') {
            console.log('Payment marked as paid, refreshing data');
            toast.info("Un paiement programmé a été effectué", {
              description: "Les soldes sont en cours de mise à jour"
            });
          }
          // Refresh without showing loading indicator
          fetchScheduledPayments(false);
        }
      )
      .subscribe();

    // Also listen for wallet transactions
    const walletTransactionsChannel = supabase
      .channel('wallet_transactions_from_payments')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wallet_transactions' },
        (payload) => {
          if ((payload.new as any).type === 'yield') {
            console.log('New yield transaction detected:', payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(scheduledPaymentsChannel);
      supabase.removeChannel(walletTransactionsChannel);
    };
  }, [fetchScheduledPayments]);

  return {
    scheduledPayments,
    isLoading: isLoading || isFetching,
    error,
    updatePaymentStatus,
    addScheduledPayment,
    refetch
  };
};

export default useScheduledPayments;
