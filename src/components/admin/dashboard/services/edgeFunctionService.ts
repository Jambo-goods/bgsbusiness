
import { supabase } from "@/integrations/supabase/client";

export const edgeFunctionService = {
  async invokeUpdateTransferEdgeFunction(
    transferId: string, 
    status: string,
    userId?: string,
    isProcessed?: boolean,
    creditWallet: boolean = true // Keep parameter with default value
  ) {
    try {
      console.log("Invoking edge function with params:", {
        transferId, status, userId, isProcessed, creditWallet
      });
      
      // Only credit wallet if the status is "completed" or "received"
      const shouldCreditWallet = creditWallet && (status === 'completed' || status === 'received');
      
      const { data, error } = await supabase.functions.invoke('update-bank-transfer', {
        body: {
          transferId,
          status,
          isProcessed,
          notes: `Updated to ${status} via edge function`,
          userId,
          sendNotification: shouldCreditWallet,
          creditWallet: shouldCreditWallet // Only credit if status is appropriate
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        return {
          success: false,
          message: `Edge Function Error: ${error.message}`,
          error: error
        };
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error: any) {
      console.error("Error invoking edge function:", error);
      return {
        success: false,
        message: `Error: ${error.message || 'Unknown error'}`,
        error: error
      };
    }
  }
};
