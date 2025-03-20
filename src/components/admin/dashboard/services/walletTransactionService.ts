
import { supabase } from "@/integrations/supabase/client";
import { baseTransferService } from "./baseTransferService";

export const walletTransactionService = {
  async updateWalletTransaction(transferId: string, newStatus: string) {
    try {
      console.log(`Mise à jour de wallet_transaction ${transferId} avec statut ${newStatus}`);
      
      const { data: walletTransferData } = await baseTransferService.findWalletTransaction(transferId);
      
      if (!walletTransferData) {
        console.error("Transaction portefeuille non trouvée:", transferId);
        return {
          success: false,
          message: "Transaction portefeuille non trouvée",
          error: new Error("Transaction portefeuille non trouvée")
        };
      }
      
      console.log("Transaction portefeuille trouvée:", walletTransferData);
      
      // Update the wallet transaction
      const { data, error } = await supabase
        .from('wallet_transactions')
        .update({
          status: newStatus === 'received' ? 'completed' : newStatus,
          receipt_confirmed: newStatus === 'received',
        })
        .eq('id', transferId)
        .select();
      
      if (error) {
        console.error("Erreur de mise à jour de wallet_transaction:", error);
        return {
          success: false,
          message: `Erreur de mise à jour: ${error.message}`,
          error: error
        };
      }
      
      // Update wallet balance if needed
      if (newStatus === 'received' && walletTransferData.user_id) {
        await baseTransferService.recalculateWalletBalance(walletTransferData.user_id);
      }
      
      return {
        success: true,
        message: `Transaction mise à jour avec succès: ${newStatus}`,
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
