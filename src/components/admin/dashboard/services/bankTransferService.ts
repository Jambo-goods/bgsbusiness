
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
      
      // Récupérer les données du virement pour obtenir l'ID utilisateur
      const { data: transferData, error: transferError } = await supabase
        .from("bank_transfers")
        .select("user_id, status, processed")
        .eq("id", transferId)
        .maybeSingle(); // Using maybeSingle instead of single to handle no rows found
      
      if (transferError) {
        console.error("Erreur lors de la récupération du virement:", transferError);
        return { 
          success: false, 
          message: `Erreur de récupération: ${transferError.message}`,
          error: transferError
        };
      }
      
      if (!transferData) {
        console.error("Aucun transfert trouvé avec cet ID:", transferId);
        return {
          success: false,
          message: "Transfert non trouvé",
          error: new Error("Transfert non trouvé")
        };
      }
      
      console.log("Données du virement récupérées:", transferData);
      
      // Utiliser la fonction edge pour mise à jour avec privilèges admin
      const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke(
        'update-bank-transfer',
        {
          body: {
            transferId: transferId,
            status: newStatus,
            isProcessed: newStatus === 'received' || processedDate !== null,
            notes: `Mise à jour via service le ${new Date().toLocaleDateString('fr-FR')}`,
            userId: transferData?.user_id,
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
            data: transferData
          };
        }
        
        console.log("Mise à jour directe réussie:", data);
        
        // Si le statut est 'received', mettre à jour le solde du portefeuille
        if (newStatus === 'received' && transferData?.user_id) {
          try {
            const { error: walletError } = await supabase.rpc('recalculate_wallet_balance', {
              user_uuid: transferData.user_id
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
          data: transferData
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
