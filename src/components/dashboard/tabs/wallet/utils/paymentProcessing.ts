
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Process a single payment through the edge function
 */
export const processSinglePayment = async (
  paymentId: string,
  projectId: string,
  percentage: number
): Promise<{ success: boolean, processed?: number, message?: string }> => {
  try {
    console.log(`Processing payment ${paymentId} for project ${projectId}`);
    
    const { data: result, error } = await supabase.functions.invoke(
      'update-wallet-on-payment',
      {
        body: {
          paymentId: paymentId,
          projectId: projectId,
          percentage: percentage,
          processAll: true,
          forceRefresh: true
        }
      }
    );
    
    if (error) {
      console.error(`Error processing payment ${paymentId}:`, error);
      return {
        success: false,
        message: error.message || "Erreur lors du traitement du paiement"
      };
    } 
    
    console.log(`Successfully processed payment ${paymentId}:`, result);
    return {
      success: true,
      processed: result?.processed || 0
    };
  } catch (err) {
    console.error(`Error invoking edge function for payment ${paymentId}:`, err);
    return {
      success: false,
      message: "Erreur lors de la mise à jour des soldes"
    };
  }
};

/**
 * Check and process any unprocessed payments
 */
export const checkForUnprocessedPayments = async (
  refreshBalance: (() => Promise<void>) | undefined
): Promise<void> => {
  try {
    const { data: payments } = await supabase
      .from('scheduled_payments')
      .select('id, project_id, percentage')
      .eq('status', 'paid')
      .is('processed_at', null);
      
    if (payments && payments.length > 0) {
      console.log(`Found ${payments.length} unprocessed paid payments`);
      toast.info("Traitement des paiements en attente", {
        description: "Veuillez patienter pendant que nous mettons à jour votre solde"
      });
      
      let successCount = 0;
      
      for (const payment of payments) {
        const result = await processSinglePayment(
          payment.id,
          payment.project_id,
          payment.percentage
        );
        
        if (result.success && result.processed && result.processed > 0) {
          successCount += result.processed;
        }
      }
      
      if (successCount > 0) {
        if (refreshBalance) {
          await refreshBalance(false);
        }
        
        toast.success("Paiement traité", {
          description: `${successCount} rendements ont été crédités sur votre compte`
        });
      }
    } else {
      console.log("No unprocessed payments found");
    }
  } catch (err) {
    console.error("Error checking for unprocessed payments:", err);
  }
};
