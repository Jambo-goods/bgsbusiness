
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Process a single payment through the edge function
 * with improved error handling to prevent import failures
 */
export const processSinglePayment = async (
  paymentId: string,
  projectId: string,
  percentage: number
): Promise<{ success: boolean, processed?: number, message?: string }> => {
  try {
    console.log(`Processing payment ${paymentId} for project ${projectId}`);
    
    // Check if we have a valid Supabase client before proceeding
    if (!supabase || !supabase.functions) {
      console.error("Invalid Supabase client configuration");
      return {
        success: false,
        message: "Erreur de configuration du client Supabase"
      };
    }
    
    // Log more details about the payment being processed
    console.log(`Sending request to edge function with parameters:`, {
      paymentId,
      projectId,
      percentage,
      processAll: true,
      forceRefresh: true
    });
    
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
    
    console.log(`Payment processing result for ${paymentId}:`, result);
    
    // Handle case where payment was successfully processed but no investors needed to be credited
    if (result.processed === 0 && !result.errors) {
      console.log(`Payment ${paymentId} processed successfully, but no investors to credit`);
      
      // Check if there's a specific reason in the result message
      if (result.message && result.message.includes("No investors to credit")) {
        return {
          success: true,
          processed: 0,
          message: "Aucun investisseur à créditer pour ce paiement"
        };
      }
      
      return {
        success: true,
        processed: 0,
        message: "Aucun investisseur à créditer pour ce paiement. Vérifiez les investissements actifs."
      };
    }
    
    console.log(`Successfully processed payment ${paymentId}:`, result);
    return {
      success: true,
      processed: result?.processed || 0,
      message: result?.message
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
    
    // Safety check for supabase client
    if (!supabase) {
      console.error("Supabase client is not initialized");
      toast.error("Erreur de connexion à la base de données");
      return;
    }
    
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
      
    if (!payments || payments.length === 0) {
      console.log("No unprocessed payments found");
      return;
    }
    
    console.log(`Found ${payments.length} unprocessed paid payments`);
    toast.info("Traitement des paiements en attente", {
      description: "Veuillez patienter pendant que nous mettons à jour votre solde"
    });
    
    let successCount = 0;
    let errorCount = 0;
    let noInvestorsCount = 0;
    
    for (const payment of payments) {
      try {
        // Get more information about this project for better logging
        const { data: projectInfo } = await supabase
          .from('projects')
          .select('name, id')
          .eq('id', payment.project_id)
          .single();
          
        console.log(`Processing payment for project: ${projectInfo?.name || payment.project_id}`);
        
        // Also check if there are active investments for this project
        const { data: investments } = await supabase
          .from('investments')
          .select('id')
          .eq('project_id', payment.project_id)
          .eq('status', 'active');
          
        console.log(`Project ${projectInfo?.name || payment.project_id} has ${investments?.length || 0} active investments`);
        
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
        description: `${noInvestorsCount} paiement(s) sans investisseurs actifs à créditer.`
      });
    }
    
    if (successCount > 0) {
      toast.success("Paiement traité", {
        description: `${successCount} rendement(s) ont été crédités sur votre compte`
      });
    }
  } catch (err) {
    console.error("Error checking for unprocessed payments:", err);
    toast.error("Erreur lors de la vérification des paiements", {
      description: "Veuillez réessayer ultérieurement"
    });
  }
};

