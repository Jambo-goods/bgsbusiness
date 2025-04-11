
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Process a payment by updating wallet balances for all investors
 * @param paymentId The ID of the payment to process
 * @param projectId The project ID associated with the payment
 * @param paymentPercentage The percentage of the yield to distribute
 * @returns Result of the processing operation
 */
export const processPayment = async (
  paymentId: string, 
  projectId: string, 
  paymentPercentage: number
) => {
  console.log(`Démarrage du traitement du paiement ${paymentId} pour le projet ${projectId}`);
  
  try {
    // First check if there are active investments for this project
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select('id')
      .eq('project_id', projectId)
      .eq('status', 'active');
    
    if (investmentsError) {
      console.error("Error checking investments:", investmentsError);
    } else {
      console.log(`Project ${projectId} has ${investments?.length || 0} active investments`);
    }
    
    const { data: result, error } = await supabase.functions.invoke(
      'update-wallet-on-payment',
      {
        body: {
          paymentId: paymentId,
          projectId: projectId,
          percentage: paymentPercentage,
          processAll: true,
          forceRefresh: true
        }
      }
    );
    
    if (error) {
      console.error(`Erreur lors du traitement du paiement ${paymentId}:`, error);
      throw new Error(error.message);
    }
    
    console.log(`Paiement ${paymentId} traité avec succès:`, result);
    
    // Check if no investors were processed but it's not an error
    if (result && result.processed === 0 && !result.errors) {
      // This is a successful process but with no investors to credit
      return {
        success: true,
        processed: 0,
        message: "Aucun investisseur actif à créditer pour ce paiement"
      };
    }
    
    return result;
  } catch (err) {
    console.error(`Erreur lors de l'appel de la fonction edge:`, err);
    throw err;
  }
};

/**
 * Update the payment status directly in the database
 * @param paymentId The ID of the payment to update
 * @param status The new status to set
 * @param paymentDate The new payment date
 * @param percentage The new percentage
 * @returns Result of the database update
 */
export const updatePaymentStatusDirectly = async (
  paymentId: string,
  status: string,
  paymentDate: string,
  percentage: number,
  switchingToPaid: boolean
) => {
  console.log(`Mise à jour directe du statut du paiement ${paymentId} vers ${status}`);
  
  const { error } = await supabase
    .from('scheduled_payments')
    .update({
      status: status,
      payment_date: paymentDate,
      percentage: percentage,
      updated_at: new Date().toISOString(),
      processed_at: switchingToPaid ? null : undefined // Reset processed_at when switching to paid
    })
    .eq('id', paymentId);
    
  if (error) {
    console.error("Erreur lors de la mise à jour directe:", error);
    throw new Error(error.message);
  }
  
  return { success: true };
};

/**
 * Check if a payment is properly marked as processed
 * @param paymentId The payment ID to check
 */
export const ensurePaymentProcessed = async (paymentId: string) => {
  const { data: updatedPayment } = await supabase
    .from('scheduled_payments')
    .select('processed_at')
    .eq('id', paymentId)
    .single();
    
  if (!updatedPayment?.processed_at) {
    console.log("Le paiement n'est pas marqué comme traité, mise à jour manuelle...");
    await supabase
      .from('scheduled_payments')
      .update({ 
        processed_at: new Date().toISOString(),
        status: 'paid'
      })
      .eq('id', paymentId);
  }
};

/**
 * Handle the full process of updating and processing a payment
 */
export const handlePaymentUpdate = async (
  payment: { id: string; project_id: string; status: string },
  newStatus: string,
  newDate: string,
  newPercentage: number,
  updatePaymentStatus: (paymentId: string, status: any, date?: string, percentage?: number) => Promise<any>,
  refetch: () => Promise<any>
) => {
  try {
    // Force refresh data
    await refetch();
    
    const switchingToPaid = newStatus === 'paid' && payment.status !== 'paid';
    
    // If switching to paid, check for active investments for this project
    if (switchingToPaid) {
      const { data: investments, error: investmentsError } = await supabase
        .from('investments')
        .select('id, user_id, amount')
        .eq('project_id', payment.project_id)
        .eq('status', 'active');
      
      if (investmentsError) {
        console.error("Error checking for active investments:", investmentsError);
      } else {
        console.log(`Project has ${investments?.length || 0} active investments`);
        
        if (!investments || investments.length === 0) {
          // Check if there are ANY investments for this project (regardless of status)
          const { data: allInvestments, error } = await supabase
            .from('investments')
            .select('id, status')
            .eq('project_id', payment.project_id);
          
          if (!error) {
            console.log(`Project has ${allInvestments?.length || 0} total investments with any status`);
            
            // Group by status
            if (allInvestments && allInvestments.length > 0) {
              const statuses = {};
              allInvestments.forEach(inv => {
                statuses[inv.status] = (statuses[inv.status] || 0) + 1;
              });
              console.log('Investment statuses:', statuses);
            }
          }
        }
      }
    }
    
    // Direct update in database for immediate effect
    if (switchingToPaid || newStatus !== payment.status) {
      await updatePaymentStatusDirectly(
        payment.id, 
        newStatus, 
        newDate, 
        newPercentage,
        switchingToPaid
      );
      
      // Force refresh data after direct update
      await refetch();
    }
    
    // Update via hook after direct update
    await updatePaymentStatus(
      payment.id,
      newStatus as 'pending' | 'scheduled' | 'paid',
      newDate,
      newPercentage
    );
    
    // Process payment if switching to paid
    if (switchingToPaid) {
      toast.success("Paiement marqué comme payé", {
        description: "Traitement des rendements pour les investisseurs en cours..."
      });
      
      try {
        // Process payment directly via edge function
        const result = await processPayment(payment.id, payment.project_id, newPercentage);
        
        if (result?.processed > 0) {
          toast.success("Paiement traité avec succès", {
            description: `${result.processed} investisseur(s) ont reçu leur rendement`
          });
          
          // Ensure payment is marked as processed
          await ensurePaymentProcessed(payment.id);
        } else {
          // Even with 0 processed investors, mark the payment as processed
          await ensurePaymentProcessed(payment.id);
          
          // Show information about no investors to credit
          toast.info("Aucun investisseur à créditer pour ce paiement", {
            description: "Vérifiez qu'il existe des investissements actifs pour ce projet."
          });
        }
      } catch (err) {
        console.error(`Erreur lors du traitement du paiement:`, err);
        toast.error("Erreur lors de la mise à jour des soldes des investisseurs");
      }
    } else {
      toast.success("Paiement programmé mis à jour avec succès");
    }
    
    // Final refresh to ensure UI is updated
    await refetch();
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    toast.error("Une erreur est survenue lors de la mise à jour du paiement");
    throw error;
  }
};

