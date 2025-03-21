
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { baseTransferService } from "./baseTransferService";
import { walletTransactionService } from "./walletTransactionService";
import { edgeFunctionService } from "./edgeFunctionService";
import { directBankTransferService } from "./directBankTransferService";

export const bankTransferService = {
  async updateBankTransfer(transferId: string, newStatus: string, processedDate: string | null = null) {
    try {
      console.log(`Mise à jour du virement ${transferId} avec statut ${newStatus}`);
      
      // Validate transfer ID
      if (!baseTransferService.validateTransferId(transferId)) {
        return { 
          success: false, 
          message: "ID de transfert invalide",
          error: new Error("ID de transfert invalide")
        };
      }
      
      // First check if the transfer ID exists in bank_transfers table
      const { data: bankTransferData, error: bankTransferError } = await baseTransferService.findBankTransfer(transferId);

      // If not found in bank_transfers, check if it exists in wallet_transactions
      if (!bankTransferData && !bankTransferError) {
        return await walletTransactionService.updateWalletTransaction(transferId, newStatus);
      }
      
      if (bankTransferError) {
        console.error("Erreur lors de la récupération du virement:", bankTransferError);
        return { 
          success: false, 
          message: `Erreur de récupération: ${bankTransferError.message}`,
          error: bankTransferError
        };
      }
      
      if (!bankTransferData) {
        console.error("Aucun transfert trouvé avec cet ID:", transferId);
        return {
          success: false,
          message: "Transfert non trouvé",
          error: new Error("Transfert non trouvé")
        };
      }
      
      console.log("Données du virement récupérées:", bankTransferData);
      
      // Vérifier si le virement a déjà été traité
      if (bankTransferData.status === 'completed' && newStatus === 'completed') {
        console.log("Ce virement a déjà été traité comme complété");
        return {
          success: true,
          message: "Ce virement a déjà été traité comme complété",
          data: bankTransferData
        };
      }
      
      // Check if there's already a wallet transaction for this transfer
      // This helps prevent double crediting
      const { data: existingWalletTx, error: txError } = await supabase
        .from('wallet_transactions')
        .select('id, status')
        .eq('type', 'deposit')
        .eq('description', `Virement bancaire (${bankTransferData.reference})`)
        .eq('user_id', bankTransferData.user_id)
        .eq('amount', bankTransferData.amount)
        .eq('status', 'completed')
        .maybeSingle();
      
      if (existingWalletTx && (newStatus === 'completed' || newStatus === 'received')) {
        console.log("Une transaction complétée existe déjà pour ce virement:", existingWalletTx);
        return {
          success: true,
          message: "Ce virement a déjà une transaction complétée associée",
          data: bankTransferData
        };
      }
      
      // Determine if we should credit wallet based on status
      const shouldCreditWallet = (newStatus === 'completed' || newStatus === 'received') && 
                                !(existingWalletTx && existingWalletTx.status === 'completed');
      
      const { success: edgeFunctionSuccess, data: edgeFunctionData, error: edgeFunctionError } = 
        await edgeFunctionService.invokeUpdateTransferEdgeFunction(
          transferId, 
          newStatus, 
          bankTransferData?.user_id, 
          newStatus === 'completed' || newStatus === 'received' || processedDate !== null,
          shouldCreditWallet // Pass parameter to control whether to credit wallet
        );
      
      if (edgeFunctionSuccess && edgeFunctionData?.success) {
        return {
          success: true,
          message: `Virement mis à jour avec succès via edge function: ${newStatus}`,
          data: edgeFunctionData.data
        };
      }
      
      // Fall back to direct update if edge function fails
      return await directBankTransferService.updateBankTransferDirectly(
        transferId, 
        newStatus, 
        processedDate,
        bankTransferData,
        shouldCreditWallet // Pass parameter to control whether to credit wallet
      );
      
    } catch (error: any) {
      console.error("Erreur inattendue:", error);
      return {
        success: false,
        message: `Erreur système: ${error.message || 'Erreur inconnue'}`,
        error: error
      };
    }
  },
  
  // Subscribe to real-time changes on the bank transfers table
  subscribeToTransferChanges(callback) {
    return supabase
      .channel('bank_transfers_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bank_transfers' }, 
        (payload) => {
          console.log('Changement détecté sur bank_transfers:', payload);
          if (callback && typeof callback === 'function') {
            callback(payload);
          }
        }
      )
      .subscribe();
  }
};
