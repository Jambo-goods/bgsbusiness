
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BankTransferItem } from "../types/bankTransfer";
import { logAdminAction } from "@/services/adminAuthService";
import { notificationService } from "@/services/notifications";

export const bankTransferService = {
  async confirmDeposit(item: BankTransferItem, amount: number): Promise<boolean> {
    try {
      if (!amount || amount <= 0) {
        toast.error("Veuillez saisir un montant valide supérieur à zéro");
        return false;
      }
      
      // Get current admin information
      const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      
      console.log(`Traitement du dépôt ${item.id} pour un montant de ${amount}€`);
      
      // Direct UPDATE using service role (bypassing RLS)
      const { error: updateError } = await supabase
        .from('bank_transfers')
        .update({ 
          status: 'received',
          processed: true,
          processed_at: new Date().toISOString(),
          amount: amount,
          notes: `Dépôt confirmé par admin le ${new Date().toLocaleDateString('fr-FR')}`
        })
        .eq('id', item.id);
        
      if (updateError) {
        console.error("Erreur lors de la mise à jour de la transaction:", updateError);
        return false;
      }
        
      // Increment the user's wallet balance
      const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
        user_id: item.user_id,
        increment_amount: amount
      });
      
      if (balanceError) {
        console.error("Erreur lors de la mise à jour du solde:", balanceError);
        // Utiliser recalculate comme fallback
        await supabase.rpc('recalculate_wallet_balance', {
          user_uuid: item.user_id
        });
      }
      
      // Create a notification for the user
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: item.user_id,
          title: "Dépôt confirmé",
          message: `Votre dépôt de ${amount}€ a été validé et ajouté à votre portefeuille.`,
          type: "deposit",
          data: {
            category: "success",
            amount,
            transaction_id: item.id
          }
        });
        
      if (notificationError) {
        console.error("Erreur lors de la création de la notification:", notificationError);
      }
      
      // Use the notification service properly
      try {
        await notificationService.depositSuccess(amount);
        console.log("Notification de confirmation de dépôt envoyée");
      } catch (notifyError) {
        console.error("Erreur avec le service de notification:", notifyError);
      }
      
      // Log admin action
      if (adminUser.id) {
        await logAdminAction(
          adminUser.id,
          'wallet_management',
          `Confirmation de dépôt de ${amount}€`,
          item.user_id,
          undefined,
          amount
        );
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la confirmation du dépôt:", error);
      return false;
    }
  },

  async rejectDeposit(item: BankTransferItem): Promise<boolean> {
    try {
      // Get current admin information
      const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      
      console.log(`Rejet du dépôt ${item.id}`);
      
      // Direct UPDATE using service role (bypassing RLS)
      const { error: updateError } = await supabase
        .from('bank_transfers')
        .update({ 
          status: 'rejected',
          processed: true,
          processed_at: new Date().toISOString(),
          notes: `Dépôt rejeté par admin le ${new Date().toLocaleDateString('fr-FR')}`
        })
        .eq('id', item.id);
          
      if (updateError) {
        console.error("Erreur lors du rejet de la transaction:", updateError);
        return false;
      }
      
      // Create a notification for the user
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: item.user_id,
          title: "Dépôt rejeté",
          message: "Votre demande de dépôt n'a pas pu être validée. Veuillez contacter le support pour plus d'informations.",
          type: "deposit",
          data: {
            category: "error"
          }
        });
        
      if (notificationError) {
        console.error("Erreur lors de la création de la notification de rejet:", notificationError);
      }
      
      // Log admin action
      if (adminUser.id) {
        await logAdminAction(
          adminUser.id,
          'wallet_management',
          `Rejet de demande de dépôt`,
          item.user_id
        );
      }
      
      toast.success("Dépôt rejeté");
      return true;
    } catch (error) {
      console.error("Erreur lors du rejet du dépôt:", error);
      toast.error("Une erreur est survenue lors du rejet");
      return false;
    }
  },

  async confirmReceipt(item: BankTransferItem): Promise<boolean> {
    try {
      // Get current admin information
      const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      
      console.log(`Confirmation de réception pour ${item.id}`);
      
      // Direct UPDATE using service role (bypassing RLS)
      const { error: directUpdateError } = await supabase
        .from('bank_transfers')
        .update({ 
          status: 'received',
          processed: true,
          processed_at: new Date().toISOString(),
          notes: `Réception confirmée par admin le ${new Date().toLocaleDateString('fr-FR')}`
        })
        .eq('id', item.id);
          
      if (directUpdateError) {
        console.error("Erreur lors de la mise à jour directe:", directUpdateError);
        return false;
      }
      
      console.log("Mise à jour directe réussie pour", item.id);
      
      // Créer notification
      await this.createReceiptNotification(item);
      
      // Log admin action
      if (adminUser.id) {
        await logAdminAction(
          adminUser.id,
          'wallet_management',
          `Confirmation de réception de virement - Réf: ${item.description || item.reference}`,
          item.user_id
        );
      }
      
      // Call recalculate wallet balance
      try {
        await supabase.rpc('recalculate_wallet_balance', {
          user_uuid: item.user_id
        });
        console.log("Solde recalculé pour l'utilisateur", item.user_id);
      } catch (balanceError) {
        console.error("Erreur lors du recalcul du solde:", balanceError);
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la confirmation de réception:", error);
      toast.error("Une erreur est survenue lors de la confirmation de réception");
      return false;
    }
  },
  
  // Méthode auxiliaire pour créer les notifications de réception
  async createReceiptNotification(item: BankTransferItem): Promise<void> {
    try {
      const { error: notifyError } = await supabase
        .from('notifications')
        .insert({
          user_id: item.user_id,
          title: "Virement reçu",
          message: `Votre virement bancaire (réf: ${item.reference || item.description}) a été reçu et est en cours de traitement.`,
          type: "deposit",
          data: {
            category: "info",
            reference: item.reference || item.description
          }
        });
        
      if (notifyError) {
        console.error("Erreur lors de la création de notification:", notifyError);
      }
    } catch (error) {
      console.error("Erreur lors de la création de notification:", error);
    }
  },
  
  async updateBankTransfer(transferId: string, status: string, processedDate: string | null): Promise<{success: boolean, message: string, data?: any}> {
    try {
      console.log(`Mise à jour du virement ${transferId} avec statut ${status}`);
      
      // Determine if transfer should be marked as processed
      const isProcessed = status === 'received' || status === 'reçu' || status === 'rejected';
      
      // Define the update data
      const updateData = {
        status: status,
        processed: isProcessed,
        processed_at: processedDate || (isProcessed ? new Date().toISOString() : null),
        notes: `Mise à jour manuelle le ${new Date().toLocaleDateString('fr-FR')}`
      };
      
      console.log("Données de mise à jour:", updateData);
      
      // Direct UPDATE with service role (bypassing RLS)
      const { data, error } = await supabase
        .from('bank_transfers')
        .update(updateData)
        .eq('id', transferId)
        .select();
        
      if (error) {
        console.error("Erreur lors de la mise à jour directe:", error);
        return {
          success: false,
          message: `Erreur de mise à jour: ${error.message}`
        };
      }
      
      // Verify the update was successful
      const { data: checkData, error: checkError } = await supabase
        .from('bank_transfers')
        .select('status, processed, processed_at, user_id')
        .eq('id', transferId)
        .single();
        
      if (checkError) {
        console.error("Erreur lors de la vérification:", checkError);
        return {
          success: false,
          message: "Impossible de vérifier l'état après mise à jour"
        };
      }
      
      const success = checkData.status === status;
      
      // Update wallet balance if successful
      if (success && checkData.user_id && (status === 'received' || status === 'reçu')) {
        try {
          await supabase.rpc('recalculate_wallet_balance', {
            user_uuid: checkData.user_id
          });
          console.log("Solde recalculé pour l'utilisateur", checkData.user_id);
        } catch (rpcError) {
          console.error("Erreur lors du recalcul du solde:", rpcError);
        }
      }
      
      return {
        success: success,
        message: success ? 'Virement mis à jour avec succès' : `Échec de mise à jour. Statut: ${checkData.status}`,
        data: checkData
      };
    } catch (error: any) {
      console.error("Erreur générale:", error);
      return {
        success: false,
        message: error.message || 'Une erreur inconnue est survenue'
      };
    }
  }
};
