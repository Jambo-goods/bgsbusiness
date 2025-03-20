
import { supabase } from "@/integrations/supabase/client";
import { baseTransferService } from "./baseTransferService";

export const directBankTransferService = {
  async updateBankTransferDirectly(
    transferId: string, 
    newStatus: string, 
    processedDate: string | null = null,
    bankTransferData: any
  ) {
    try {
      console.log("Mise à jour directe du transfert bancaire:", {
        transferId,
        newStatus,
        processedDate
      });
      
      const isProcessed = newStatus === 'received' || processedDate !== null;
      
      const { data, error } = await supabase
        .from('bank_transfers')
        .update({
          status: newStatus,
          processed: isProcessed,
          processed_at: isProcessed ? (processedDate || new Date().toISOString()) : null,
          notes: `Mise à jour via service le ${new Date().toLocaleDateString('fr-FR')}`
        })
        .eq('id', transferId)
        .select();
      
      if (error) {
        console.error("Erreur de mise à jour directe:", error);
        return {
          success: false,
          message: `Erreur de mise à jour: ${error.message}`,
          error: error,
          data: bankTransferData
        };
      }
      
      console.log("Mise à jour directe réussie:", data);
      
      // Si le statut est 'received', mettre à jour le solde du portefeuille
      if (newStatus === 'received' && bankTransferData?.user_id) {
        await baseTransferService.recalculateWalletBalance(bankTransferData.user_id);
      }
      
      return {
        success: true,
        message: `Virement mis à jour avec succès: ${newStatus}`,
        data: data
      };
    } catch (error: any) {
      console.error("Erreur inattendue:", error);
      return {
        success: false,
        message: `Erreur système: ${error.message || 'Erreur inconnue'}`,
        error: error
      };
    }
  }
};
