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
      
      // Get Admin JWT token from local storage to use service role
      const adminToken = localStorage.getItem('admin_token');
      
      // Direct UPDATE with proper header setting for authorization
      let query = supabase
        .from('bank_transfers')
        .update(updateData)
        .eq('id', transferId)
        .select('*');
        
      // Add authorization headers if token is available
      // Using the correct method to add headers in Supabase JS client
      if (adminToken) {
        // We need to use the correct method to set headers
        query = query.headers({
          Authorization: `Bearer ${adminToken}`
        });
      }
      
      // Execute the query
      const { data, error } = await query;
        
      if (error) {
        console.error("Erreur lors de la mise à jour directe:", error);
        
        // Fall back to alternative method using stored procedures if available
        try {
          // Attempt to use RPC call with admin role
          const { data: rpcData, error: rpcError } = await supabase.rpc('admin_mark_bank_transfer', {
            transfer_id: transferId,
            new_status: status,
            is_processed: isProcessed,
            processed_date: processedDate || (isProcessed ? new Date().toISOString() : null)
          });
          
          if (rpcError) {
            console.error("Erreur lors de l'appel RPC:", rpcError);
            return {
              success: false,
              message: `Échec via RPC: ${rpcError.message}`,
              data: { rpcError }
            };
          }
          
          console.log("Mise à jour via RPC réussie:", rpcData);
          return {
            success: true,
            message: "Mise à jour via RPC réussie",
            data: rpcData
          };
        } catch (rpcError) {
          console.error("Exception lors de l'appel RPC:", rpcError);
          return {
            success: false,
            message: `Échec global: ${error.message}`,
            data: { error, rpcError }
          };
        }
      }
      
      // Verify the update was successful by fetching the updated record
      const { data: updatedTransfer, error: fetchError } = await supabase
        .from('bank_transfers')
        .select('*')
        .eq('id', transferId)
        .single();
        
      if (fetchError) {
        console.error("Erreur lors de la vérification après mise à jour:", fetchError);
        return {
          success: false,
          message: "Impossible de vérifier l'état après mise à jour"
        };
      }
      
      const success = updatedTransfer.status === status;
      
      // Update wallet balance if successful
      if (success && updatedTransfer.user_id && (status === 'received' || status === 'reçu')) {
        try {
          // Use recalculate function if available, otherwise increment
          try {
            await supabase.rpc('recalculate_wallet_balance', {
              user_uuid: updatedTransfer.user_id
            });
            console.log("Solde recalculé pour l'utilisateur", updatedTransfer.user_id);
          } catch (rpcError) {
            console.error("Erreur lors du recalcul du solde via RPC:", rpcError);
            
            // If transfer has an amount, try direct update as fallback
            if (updatedTransfer.amount) {
              const { error: updateError } = await supabase.rpc('increment_wallet_balance', {
                user_id: updatedTransfer.user_id,
                increment_amount: updatedTransfer.amount
              });
              
              if (updateError) {
                console.error("Erreur lors de l'incrémentation du solde:", updateError);
              } else {
                console.log("Solde incrémenté directement de", updatedTransfer.amount);
              }
            }
          }
          
          // Create a notification for the user
          try {
            const { error: notifError } = await supabase
              .from('notifications')
              .insert({
                user_id: updatedTransfer.user_id,
                title: "Virement reçu",
                message: `Votre virement bancaire (réf: ${updatedTransfer.reference}) a été traité.`,
                type: "deposit",
                data: {
                  amount: updatedTransfer.amount,
                  reference: updatedTransfer.reference
                }
              });
              
            if (notifError) {
              console.error("Erreur lors de la création de notification:", notifError);
            }
          } catch (notifError) {
            console.error("Exception lors de la création de notification:", notifError);
          }
        } catch (balanceError) {
          console.error("Erreur générale lors de la mise à jour du solde:", balanceError);
        }
      }
      
      return {
        success: success,
        message: success ? 'Virement mis à jour avec succès' : `Échec de mise à jour. Statut: ${updatedTransfer.status}`,
        data: updatedTransfer
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
