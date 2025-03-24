
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScheduledPayment } from "../types/investment";

export function useScheduledPayments(projectId: string | undefined) {
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [firstPaymentDelay, setFirstPaymentDelay] = useState<number>(1);

  const fetchScheduledPayments = useCallback(async () => {
    if (!projectId) return;
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      // Get project details for first payment delay
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("first_payment_delay_months")
        .eq("id", projectId)
        .single();
        
      if (projectError) {
        throw new Error(projectError.message);
      }
      
      const firstPaymentDelayMonths = projectData?.first_payment_delay_months || 1;
      setFirstPaymentDelay(firstPaymentDelayMonths);
      
      // Get scheduled payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("scheduled_payments")
        .select(`
          *,
          projects:project_id (
            name,
            image,
            company_name,
            status,
            first_payment_delay_months
          )
        `)
        .eq("project_id", projectId)
        .order("payment_date", { ascending: true });

      if (paymentsError) {
        throw new Error(paymentsError.message);
      }
      
      // Convert to typed payments
      const typedPayments = paymentsData?.map(payment => ({
        ...payment,
        status: (payment.status === 'paid' ? 'paid' : 
                payment.status === 'pending' ? 'pending' : 'scheduled') as 'scheduled' | 'pending' | 'paid'
      })) || [];
      
      setScheduledPayments(typedPayments);
    } catch (err: any) {
      console.error("Error fetching scheduled payments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      fetchScheduledPayments();
    }
    
    // Set up real-time listener
    const channel = projectId ? supabase
      .channel('scheduled_payments_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'scheduled_payments',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          fetchScheduledPayments();
        }
      )
      .subscribe() : null;

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [projectId, fetchScheduledPayments]);

  // Function to update payment status
  const updatePaymentStatus = async (
    paymentId: string,
    newStatus: 'pending' | 'scheduled' | 'paid',
    newDate?: string,
    newPercentage?: number
  ) => {
    try {
      console.log(`Updating payment ${paymentId} to status: ${newStatus}`);
      
      // First refresh to ensure we have the latest data, without showing loading
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

      // Success! Refresh the payments list without showing loading
      await fetchScheduledPayments();
      
      return true;
    } catch (error: any) {
      console.error('Error in updatePaymentStatus:', error);
      throw error;
    }
  };

  return {
    scheduledPayments,
    loading,
    error,
    isRefreshing,
    firstPaymentDelay,
    refreshData: fetchScheduledPayments,
    updatePaymentStatus
  };
}
