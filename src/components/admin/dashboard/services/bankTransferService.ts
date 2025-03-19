
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
      
      // 1. Update the wallet transaction status to completed and set the amount
      const { error: updateError } = await supabase
        .from('wallet_transactions')
        .update({ 
          status: 'completed',
          amount: amount
        })
        .eq('id', item.id);
        
      if (updateError) {
        console.error("Erreur lors de la mise à jour de la transaction:", updateError);
        throw updateError;
      }
      
      // 2. Increment the user's wallet balance
      const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
        user_id: item.user_id,
        increment_amount: amount
      });
      
      if (balanceError) {
        console.error("Erreur lors de la mise à jour du solde:", balanceError);
        throw balanceError;
      }
      
      // 3. Create a notification for the user
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
      
      // 4. Use the notification service properly
      try {
        await notificationService.depositSuccess(amount);
        console.log("Notification de confirmation de dépôt envoyée");
      } catch (notifyError) {
        console.error("Erreur avec le service de notification:", notifyError);
      }
      
      // 5. Send notification via Edge Function
      try {
        const { error: notificationFnError } = await supabase.functions.invoke('send-user-notification', {
          body: {
            userEmail: item.profile?.email,
            userName: `${item.profile?.first_name} ${item.profile?.last_name}`,
            subject: 'Dépôt confirmé sur BGS Invest',
            eventType: 'deposit',
            data: {
              amount: amount,
              status: 'completed'
            }
          }
        });
        
        if (notificationFnError) {
          console.error("Erreur lors de l'envoi de la notification par email:", notificationFnError);
        }
      } catch (emailError) {
        console.error("Erreur lors de l'envoi du mail de confirmation:", emailError);
      }
      
      // 6. If this was a bank transfer originally, update its status as well
      if (item.source === 'bank_transfers') {
        try {
          // Direct update of bank_transfer record with full parameters
          const { data: transferData, error: transferError } = await supabase
            .from('bank_transfers')
            .update({ 
              status: 'received',
              processed: true,
              processed_at: new Date().toISOString(),
              notes: `Dépôt confirmé par admin le ${new Date().toLocaleDateString('fr-FR')}`
            })
            .eq('id', item.id)
            .select();
            
          if (transferError) {
            console.error("Erreur lors de la mise à jour du virement bancaire:", transferError);
            console.error("Détails:", transferError.details, transferError.hint);
            
            // Force using RPC to update the wallet balance as a fallback
            await supabase.rpc('recalculate_wallet_balance', {
              user_uuid: item.user_id
            });
          } else {
            console.log("Mise à jour du virement bancaire réussie:", transferData);
          }
        } catch (bankTransferError) {
          console.error("Exception lors de la mise à jour du virement:", bankTransferError);
          // This shouldn't prevent completion, as the wallet was already updated
        }
      }
      
      // 7. Log admin action
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
      
      toast.success("Dépôt confirmé avec succès");
      return true;
    } catch (error) {
      console.error("Erreur lors de la confirmation du dépôt:", error);
      toast.error("Une erreur est survenue lors de la confirmation");
      return false;
    }
  },

  async rejectDeposit(item: BankTransferItem): Promise<boolean> {
    try {
      // Get current admin information
      const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      
      console.log(`Rejet du dépôt ${item.id}`);
      
      // 1. Update the wallet transaction status to rejected
      const { error: updateError } = await supabase
        .from('wallet_transactions')
        .update({ status: 'rejected' })
        .eq('id', item.id);
        
      if (updateError) {
        console.error("Erreur lors du rejet de la transaction:", updateError);
        throw updateError;
      }
      
      // 2. If this was a bank transfer originally, update its status as well
      if (item.source === 'bank_transfers') {
        try {
          const { error: transferError } = await supabase
            .from('bank_transfers')
            .update({ 
              status: 'rejected',
              processed: true,
              processed_at: new Date().toISOString(),
              notes: `Dépôt rejeté par admin le ${new Date().toLocaleDateString('fr-FR')}`
            })
            .eq('id', item.id);
            
          if (transferError) {
            console.error("Erreur lors de la mise à jour du rejet de virement:", transferError);
          }
        } catch (bankTransferError) {
          console.error("Exception lors du rejet du virement:", bankTransferError);
        }
      }
      
      // 3. Create a notification for the user
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
      
      // 4. Log admin action
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
      
      let success = false;
      
      // 1. Update receipt confirmation - try with wallet_transactions first
      if (item.source === 'wallet_transactions') {
        const { error: updateError } = await supabase
          .from('wallet_transactions')
          .update({ receipt_confirmed: true })
          .eq('id', item.id);
          
        if (updateError) {
          console.error("Erreur lors de la confirmation de réception (wallet):", updateError);
        } else {
          success = true;
        }
      }
      
      // 2. If this was a bank transfer originally, update its status
      if (item.source === 'bank_transfers' || !success) {
        try {
          // Try alternate approach using RPC or direct SQL if available
          const { data, error: transferError } = await supabase
            .from('bank_transfers')
            .update({ 
              status: 'received', 
              processed: true,
              notes: `Réception confirmée par admin le ${new Date().toLocaleDateString('fr-FR')}`
            })
            .eq('id', item.id)
            .select();
            
          if (transferError) {
            console.error("Erreur lors de la mise à jour du statut de réception:", transferError);
            console.error("Détails:", transferError.details, transferError.hint);
            
            // Fallback: try to update using recalculate
            try {
              await supabase.rpc('recalculate_wallet_balance', {
                user_uuid: item.user_id
              });
              success = true;
              console.log("Mise à jour du solde via RPC réussie");
            } catch (rpcError) {
              console.error("Erreur lors de la mise à jour via RPC:", rpcError);
            }
          } else {
            success = true;
            console.log("Mise à jour du statut de réception réussie:", data);
          }
        } catch (bankTransferError) {
          console.error("Exception lors de la confirmation de réception:", bankTransferError);
        }
      }
      
      // 3. Log admin action if any update succeeded
      if (success && adminUser.id) {
        await logAdminAction(
          adminUser.id,
          'wallet_management',
          `Confirmation de réception de virement - Réf: ${item.description}`,
          item.user_id
        );
        
        // Create notification
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
      }
      
      if (success) {
        toast.success("Réception de virement confirmée");
        return true;
      } else {
        toast.error("Échec de la mise à jour du statut. Veuillez réessayer.");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation de réception:", error);
      toast.error("Une erreur est survenue lors de la confirmation de réception");
      return false;
    }
  },
  
  async updateBankTransfer(transferId: string, status: string, processedDate: string | null): Promise<{success: boolean, message: string, data?: any}> {
    try {
      console.log(`Mise à jour du virement ${transferId} avec statut ${status}`);
      
      // Create update payload
      const updates = {
        status: status,
        processed: status === 'received' || status === 'reçu',
        processed_at: processedDate || new Date().toISOString(),
        notes: `Mise à jour manuelle le ${new Date().toLocaleDateString('fr-FR')}`
      };
      
      // Implement a multi-step approach with multiple retries
      let updateSuccess = false;
      let errorDetails = '';
      let resultData = null;
      
      // Step 1: Standard update approach
      try {
        const { data, error } = await supabase
          .from('bank_transfers')
          .update(updates)
          .eq('id', transferId)
          .select();
          
        if (error) {
          console.error("Première tentative échouée:", error);
          errorDetails = `${error.message} (${error.code})`;
        } else {
          updateSuccess = true;
          resultData = data;
          console.log("Mise à jour réussie à la première tentative");
        }
      } catch (err: any) {
        console.error("Erreur lors de la première tentative:", err);
        errorDetails = err.message || 'Erreur inconnue';
      }
      
      // Step 2: If first approach failed, try with upsert
      if (!updateSuccess) {
        try {
          console.log("Tentative de mise à jour avec upsert...");
          
          // Get the current transfer data
          const { data: existingData, error: fetchError } = await supabase
            .from('bank_transfers')
            .select('*')
            .eq('id', transferId)
            .single();
            
          if (fetchError) {
            console.error("Échec de récupération des données existantes:", fetchError);
            errorDetails += ` | Récupération: ${fetchError.message}`;
          } else if (existingData) {
            // Combine existing data with updates
            const fullUpdate = {
              ...existingData,
              ...updates
            };
            
            const { data, error: upsertError } = await supabase
              .from('bank_transfers')
              .upsert(fullUpdate)
              .select();
              
            if (upsertError) {
              console.error("Échec de l'upsert:", upsertError);
              errorDetails += ` | Upsert: ${upsertError.message}`;
            } else {
              updateSuccess = true;
              resultData = data;
              console.log("Mise à jour réussie avec upsert");
            }
          }
        } catch (err: any) {
          console.error("Erreur lors de la seconde tentative (upsert):", err);
          errorDetails += ` | Upsert exception: ${err.message || 'Erreur inconnue'}`;
        }
      }
      
      // Step 3: Directly call the recalculate function instead of using RPC
      if (!updateSuccess) {
        try {
          console.log("Tentative de mise à jour manuelle avec recalculate_wallet_balance...");
          
          // Get user_id for the transfer
          const { data: transferData, error: transferError } = await supabase
            .from('bank_transfers')
            .select('user_id')
            .eq('id', transferId)
            .single();
            
          if (transferError) {
            console.error("Échec de récupération de l'ID utilisateur:", transferError);
            errorDetails += ` | User ID: ${transferError.message}`;
          } else if (transferData && transferData.user_id) {
            // Call recalculate_wallet_balance directly
            const { error: recalcError } = await supabase.rpc('recalculate_wallet_balance', {
              user_uuid: transferData.user_id
            });
            
            if (recalcError) {
              console.error("Échec de la mise à jour via recalculate_wallet_balance:", recalcError);
              errorDetails += ` | Recalculate: ${recalcError.message}`;
            } else {
              // Try to update the status again
              const { error: updateError } = await supabase
                .from('bank_transfers')
                .update(updates)
                .eq('id', transferId);
                
              if (updateError) {
                console.error("Échec de la mise à jour après recalculate:", updateError);
                errorDetails += ` | Final update: ${updateError.message}`;
              } else {
                updateSuccess = true;
                console.log("Mise à jour potentiellement réussie via recalculate_wallet_balance");
              }
            }
          }
        } catch (err: any) {
          console.error("Erreur lors de la troisième tentative (recalculate):", err);
          errorDetails += ` | Recalculate exception: ${err.message || 'Erreur inconnue'}`;
        }
      }
      
      // Verify what actually happened in the database
      const { data: finalCheck, error: checkError } = await supabase
        .from('bank_transfers')
        .select('status, processed, processed_at, user_id, amount, reference')
        .eq('id', transferId)
        .single();
        
      if (checkError) {
        console.error("Erreur lors de la vérification finale:", checkError);
        return {
          success: updateSuccess,
          message: updateSuccess 
            ? "Mise à jour potentiellement réussie, mais la vérification a échoué"
            : `Échec de mise à jour. Statut actuel: inconnu, demandé: ${status}. Erreurs: ${errorDetails}`
        };
      }
      
      // The final check is what actually determines success
      const actualSuccess = finalCheck.status === status;
      
      if (actualSuccess) {
        console.log("Vérification finale: Mise à jour réussie!");
        
        // Trigger wallet balance update on success
        if (status === 'received' || status === 'reçu') {
          try {
            await supabase.rpc('recalculate_wallet_balance', {
              user_uuid: finalCheck.user_id
            });
            console.log(`Solde du wallet mis à jour pour l'utilisateur ${finalCheck.user_id}`);
          } catch (walletError) {
            console.error("Erreur lors de la mise à jour du solde:", walletError);
          }
        }
        
        return {
          success: true,
          message: 'Virement bancaire mis à jour avec succès',
          data: finalCheck
        };
      } else {
        console.error("Vérification finale: La mise à jour n'a pas été appliquée correctement");
        console.error(`Statut actuel: ${finalCheck.status}, statut demandé: ${status}`);
        
        return {
          success: false,
          message: `Échec de mise à jour. Statut actuel: ${finalCheck.status}, demandé: ${status}`,
          data: finalCheck
        };
      }
    } catch (error: any) {
      console.error("Erreur générale lors de la mise à jour du virement:", error);
      return {
        success: false,
        message: error.message || 'Une erreur inconnue est survenue'
      };
    }
  },
  
  async forceUpdateToReceived(transferId: string): Promise<{success: boolean, message: string}> {
    try {
      console.log(`Forçage de mise à jour à 'reçu' pour virement ${transferId}`);
      
      // Get the current record to ensure we have the user ID
      const { data: currentData, error: fetchError } = await supabase
        .from('bank_transfers')
        .select('user_id, reference, amount')
        .eq('id', transferId)
        .single();
        
      if (fetchError) {
        console.error("Impossible de récupérer les données du virement:", fetchError);
        return {
          success: false,
          message: `Échec: ${fetchError.message}`
        };
      }
      
      // Step 1: Direct update to 'received' status
      const { error: updateError } = await supabase
        .from('bank_transfers')
        .update({
          status: 'received',
          processed: true,
          processed_at: new Date().toISOString(),
          notes: `Forçage de statut à reçu le ${new Date().toLocaleDateString('fr-FR')}`
        })
        .eq('id', transferId);
        
      if (updateError) {
        console.error("Échec du forçage de mise à jour:", updateError);
        return {
          success: false,
          message: `Première tentative échouée: ${updateError.message}`
        };
      }
      
      // Step 2: Update wallet balance using recalculate_wallet_balance
      try {
        const { error: recalcError } = await supabase.rpc('recalculate_wallet_balance', {
          user_uuid: currentData.user_id
        });
        
        if (recalcError) {
          console.error("Erreur lors de la mise à jour du solde:", recalcError);
          return {
            success: true, // Still return true if bank_transfer was updated
            message: `Virement mis à jour mais erreur avec le solde: ${recalcError.message}`
          };
        }
        
        console.log(`Solde du wallet mis à jour pour l'utilisateur ${currentData.user_id}`);
      } catch (walletError: any) {
        console.error("Erreur lors de la mise à jour du solde:", walletError);
        return {
          success: true, // Still return true if bank_transfer was updated
          message: `Virement mis à jour mais erreur avec le solde: ${walletError.message}`
        };
      }
      
      // Step 3: Add a notification for the user
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: currentData.user_id,
            title: "Virement reçu",
            message: `Votre virement bancaire a été marqué comme reçu manuellement.`,
            type: "deposit",
            data: {
              category: "success",
              amount: currentData.amount,
              transaction_id: transferId
            }
          });
      } catch (notificationError) {
        console.error("Erreur lors de la création de notification:", notificationError);
      }
      
      return {
        success: true,
        message: 'Virement forcé à "Reçu" et solde mis à jour'
      };
    } catch (error: any) {
      console.error("Erreur lors du forçage du statut:", error);
      return {
        success: false,
        message: `Erreur générale: ${error.message || 'Erreur inconnue'}`
      };
    }
  }
};
