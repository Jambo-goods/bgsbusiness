
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const bankTransferService = {
  async updateBankTransfer(transferId: string, newStatus: string, processedDate: string | null = null) {
    try {
      console.log(`Mise à jour du virement ${transferId} avec statut ${newStatus}`);
      
      // Vérifier que l'ID du transfert est valide
      if (!transferId || transferId.trim() === '') {
        console.error("ID de transfert invalide");
        return { 
          success: false, 
          message: "ID de transfert invalide",
          error: new Error("ID de transfert invalide")
        };
      }
      
      // First check if the transfer ID exists in bank_transfers table
      const { data: bankTransferData, error: bankTransferError } = await supabase
        .from("bank_transfers")
        .select("user_id, status, processed")
        .eq("id", transferId)
        .maybeSingle();

      // If not found in bank_transfers, check if it exists in wallet_transactions
      if (!bankTransferData && !bankTransferError) {
        const { data: walletTransferData, error: walletTransferError } = await supabase
          .from("wallet_transactions")
          .select("user_id, status, receipt_confirmed")
          .eq("id", transferId)
          .maybeSingle();
          
        if (walletTransferData) {
          console.log("Transfer found in wallet_transactions:", walletTransferData);
          
          // Update the wallet transaction directly since it's not in bank_transfers
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
            try {
              const { error: walletError } = await supabase.rpc('recalculate_wallet_balance', {
                user_uuid: walletTransferData.user_id
              });
              
              if (walletError) {
                console.error("Erreur de recalcul du solde:", walletError);
              }
            } catch (walletUpdateError) {
              console.error("Erreur lors de la mise à jour du portefeuille:", walletUpdateError);
            }
          }
          
          return {
            success: true,
            message: `Virement mis à jour avec succès: ${newStatus}`,
            data: data
          };
        }
        
        console.error("Aucun transfert trouvé avec cet ID:", transferId);
        return {
          success: false,
          message: "Transfert non trouvé",
          error: new Error("Transfert non trouvé")
        };
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
      
      // Utiliser la fonction edge pour mise à jour avec privilèges admin
      const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke(
        'update-bank-transfer',
        {
          body: {
            transferId: transferId,
            status: newStatus,
            isProcessed: newStatus === 'received' || processedDate !== null,
            notes: `Mise à jour via service le ${new Date().toLocaleDateString('fr-FR')}`,
            userId: bankTransferData?.user_id,
            sendNotification: newStatus === 'received'
          }
        }
      );
      
      if (edgeFunctionError) {
        console.error("Erreur fonction edge:", edgeFunctionError);
        
        // Fallback à la mise à jour directe si la fonction edge échoue
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
          try {
            const { error: walletError } = await supabase.rpc('recalculate_wallet_balance', {
              user_uuid: bankTransferData.user_id
            });
            
            if (walletError) {
              console.error("Erreur de recalcul du solde:", walletError);
            }
          } catch (walletUpdateError) {
            console.error("Erreur lors de la mise à jour du portefeuille:", walletUpdateError);
          }
        }
        
        return {
          success: true,
          message: `Virement mis à jour avec succès: ${newStatus}`,
          data: data
        };
      }
      
      console.log("Résultat fonction edge:", edgeFunctionData);
      
      if (edgeFunctionData?.success) {
        return {
          success: true,
          message: `Virement mis à jour avec succès via edge function: ${newStatus}`,
          data: edgeFunctionData.data
        };
      } else {
        return {
          success: false,
          message: `Échec de la mise à jour via edge function: ${edgeFunctionData?.error || 'Erreur inconnue'}`,
          error: edgeFunctionData?.error,
          data: bankTransferData
        };
      }
    } catch (error: any) {
      console.error("Erreur inattendue:", error);
      return {
        success: false,
        message: `Erreur système: ${error.message || 'Erreur inconnue'}`,
        error: error
      };
    }
  },
  
  // Abonner aux changements en temps réel sur la table des virements
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
