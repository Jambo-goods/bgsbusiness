
import { supabase } from "@/integrations/supabase/client";

export const edgeFunctionService = {
  async invokeUpdateTransferEdgeFunction(
    transferId: string, 
    newStatus: string, 
    userId: string | undefined,
    isProcessed: boolean
  ) {
    try {
      console.log("Appel de la fonction edge pour mise à jour du transfert:", {
        transferId,
        newStatus,
        userId,
        isProcessed
      });
      
      const { data, error } = await supabase.functions.invoke(
        'update-bank-transfer',
        {
          body: {
            transferId: transferId,
            status: newStatus,
            isProcessed: isProcessed,
            notes: `Mise à jour via service le ${new Date().toLocaleDateString('fr-FR')}`,
            userId: userId,
            sendNotification: newStatus === 'received'
          }
        }
      );
      
      if (error) {
        console.error("Erreur fonction edge:", error);
        return { success: false, data: null, error };
      }
      
      console.log("Résultat fonction edge:", data);
      return { success: true, data, error: null };
    } catch (error) {
      console.error("Erreur lors de l'appel de la fonction edge:", error);
      return { success: false, data: null, error };
    }
  }
};
