
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
    
    if (!result) {
      console.error(`No result returned for payment ${paymentId}`);
      return {
        success: false,
        message: "Aucune réponse du serveur lors du traitement du paiement"
      };
    }
    
    // Handle case where payment was successfully processed but no investors needed to be credited
    if (result.processed === 0 && !result.errors) {
      console.log(`Payment ${paymentId} processed successfully, but no investors to credit`);
      return {
        success: true,
        processed: 0,
        message: "Aucun investisseur à créditer pour ce paiement"
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
    console.log("Starting check for unprocessed payments");
    const { data: payments, error } = await supabase
      .from('scheduled_payments')
      .select('id, project_id, percentage')
      .eq('status', 'paid')
      .is('processed_at', null);
      
    if (error) {
      console.error("Error fetching unprocessed payments:", error);
      toast.error("Erreur lors de la vérification des paiements");
      return;
    }
      
    if (payments && payments.length > 0) {
      console.log(`Found ${payments.length} unprocessed paid payments`);
      toast.info("Traitement des paiements en attente", {
        description: "Veuillez patienter pendant que nous mettons à jour votre solde"
      });
      
      let successCount = 0;
      let errorCount = 0;
      let noInvestorsCount = 0;
      
      for (const payment of payments) {
        try {
          const result = await processSinglePayment(
            payment.id,
            payment.project_id,
            payment.percentage
          );
          
          if (result.success && result.processed && result.processed > 0) {
            successCount += result.processed;
          } else if (result.success && result.processed === 0) {
            // Case where payment was processed but no investors needed to be credited
            noInvestorsCount++;
            console.log(`Payment ${payment.id} processed but no investors to credit`);
          } else if (!result.success) {
            errorCount++;
            console.error(`Failed to process payment ${payment.id}:`, result.message);
          }
        } catch (innerError) {
          errorCount++;
          console.error(`Exception processing payment ${payment.id}:`, innerError);
        }
      }
      
      // Update the wallet balance regardless of errors to ensure UI is up-to-date
      if (refreshBalance) {
        try {
          await refreshBalance();
        } catch (refreshError) {
          console.error("Error refreshing balance:", refreshError);
        }
      }
      
      if (errorCount > 0) {
        toast.error("Certains paiements n'ont pas pu être traités", {
          description: `${errorCount} paiement(s) en erreur. Veuillez réessayer ultérieurement.`
        });
      }
      
      if (noInvestorsCount > 0) {
        toast.info("Aucun investisseur à créditer pour ce paiement", {
          description: `${noInvestorsCount} paiement(s) sans investisseurs à créditer.`
        });
      }
      
      if (successCount > 0) {
        toast.success("Paiement traité", {
          description: `${successCount} rendement(s) ont été crédités sur votre compte`
        });
      }
    } else {
      console.log("No unprocessed payments found");
    }
  } catch (err) {
    console.error("Error checking for unprocessed payments:", err);
    toast.error("Erreur lors de la vérification des paiements", {
      description: "Veuillez réessayer ultérieurement"
    });
  }
};
