
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const bankTransferService = {
  async updateBankTransfer(transferId: string, newStatus: string, processedDate: string | null = null) {
    try {
      console.log(`Mise à jour du virement ${transferId} avec statut ${newStatus}`);
      
      if (!transferId || typeof transferId !== 'string' || transferId.trim() === '') {
        console.error("ID de transfert invalide:", transferId);
        return { 
          success: false, 
          message: "ID de transfert invalide",
          error: new Error("Invalid transfer ID")
        };
      }

      // Vérifier si le transfert existe avant de tenter une mise à jour
      const { data: transferExists, error: checkError } = await supabase
        .from("bank_transfers")
        .select("id, status, user_id, amount")
        .eq("id", transferId)
        .maybeSingle();
      
      if (checkError) {
        console.error("Erreur lors de la vérification du transfert:", checkError);
        return { 
          success: false, 
          message: `Erreur de vérification: ${checkError.message}`,
          error: checkError
        };
      }
      
      if (!transferExists) {
        console.error(`Virement non trouvé: "${transferId}"`);
        return {
          success: false,
          message: "Le virement demandé n'existe pas ou a été supprimé",
          error: new Error("Transfer not found")
        };
      }
      
      console.log("Transfert trouvé pour mise à jour:", transferExists);
      
      // Utiliser un timeout pour éviter les problèmes de concurrence
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mise à jour directe du virement avec plus de détails pour le débogage
      const isProcessed = newStatus === 'received' || processedDate !== null;
      const currentTime = new Date().toISOString();
      
      const { data: updateResult, error: updateError } = await supabase
        .from('bank_transfers')
        .update({
          status: newStatus,
          processed: isProcessed,
          processed_at: isProcessed ? (processedDate || currentTime) : null,
          notes: `Mise à jour manuelle le ${new Date().toLocaleDateString('fr-FR')}`
        })
        .eq('id', transferId)
        .select();
      
      if (updateError) {
        console.error("Erreur de mise à jour directe:", updateError);
        return {
          success: false,
          message: `Erreur de mise à jour: ${updateError.message}`,
          error: updateError
        };
      }
      
      if (!updateResult || updateResult.length === 0) {
        console.error("Mise à jour effectuée mais aucune donnée retournée");
        return {
          success: true,
          message: "Mise à jour effectuée (aucune donnée retournée)",
          data: []
        };
      }
      
      console.log("Mise à jour directe réussie:", updateResult);
      
      // Si le statut est 'received', mettre à jour le solde du portefeuille
      if (newStatus === 'received' && transferExists.user_id) {
        try {
          console.log("Recalcul du solde pour l'utilisateur:", transferExists.user_id);
          const { error: walletError } = await supabase.rpc('recalculate_wallet_balance', {
            user_uuid: transferExists.user_id
          });
          
          if (walletError) {
            console.error("Erreur de recalcul du solde:", walletError);
            // On continue malgré l'erreur car la mise à jour du virement a réussi
          } else {
            console.log("Solde recalculé avec succès");
          }
        } catch (walletUpdateError) {
          console.error("Erreur lors de la mise à jour du portefeuille:", walletUpdateError);
          // On continue malgré l'erreur
        }
      }
      
      // Retourner le résultat correct pour faciliter le débogage
      return {
        success: true,
        message: `Virement mis à jour avec succès: ${newStatus}`,
        data: updateResult
      };
      
    } catch (error: any) {
      console.error("Erreur inattendue lors de la mise à jour:", error);
      return {
        success: false,
        message: `Erreur système: ${error.message || 'Erreur inconnue'}`,
        error: error
      };
    }
  },
  
  // Abonner aux changements en temps réel sur la table des virements
  subscribeToTransferChanges(callback: Function) {
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
