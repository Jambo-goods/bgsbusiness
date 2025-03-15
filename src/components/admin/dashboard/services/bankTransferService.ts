
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
      
      console.log(`Starting confirmDeposit for item ${item.id} with amount ${amount}`);
      
      // Use server timestamp for accuracy
      const serverTimestamp = new Date().toISOString();
      
      // Update the bank_transfer status to "reçu" (received)
      // The database trigger will handle updating the wallet balance
      const { error: updateError } = await supabase
        .from('bank_transfers')
        .update({ 
          status: 'reçu',
          processed: true,
          processed_at: serverTimestamp,
          amount: amount
        })
        .eq('id', item.id);
        
      if (updateError) {
        console.error("Error updating bank transfer:", updateError);
        toast.error("Erreur lors de la mise à jour du transfert bancaire");
        throw updateError;
      }
      
      console.log(`Bank transfer updated successfully. Status set to 'reçu' with amount ${amount}`);
      
      // Force recalculate the user's wallet balance to ensure it's updated
      console.log(`Recalculating wallet balance for user ${item.user_id}`);
      const { error: rpcError } = await supabase.rpc('recalculate_wallet_balance', {
        user_uuid: item.user_id
      });
      
      if (rpcError) {
        console.error("Error recalculating balance:", rpcError);
        // Continue anyway since the trigger should have handled it
      } else {
        console.log(`Successfully recalculated balance for user ${item.user_id}`);
      }
      
      // Create a notification for the user
      await supabase
        .from('notifications')
        .insert({
          user_id: item.user_id,
          title: "Dépôt réussi",
          description: `Votre dépôt de ${amount}€ a été validé et ajouté à votre portefeuille.`,
          type: "deposit",
          category: "success",
          metadata: {
            amount,
            transaction_id: item.id,
            timestamp: serverTimestamp // Add timestamp to metadata
          },
          created_at: serverTimestamp // Explicitly set creation time
        });
      
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
      
      // 1. Update the wallet transaction status to rejected
      await supabase
        .from('wallet_transactions')
        .update({ status: 'rejected' })
        .eq('id', item.id);
      
      // 2. Update bank_transfer status to "rejected"
      await supabase
        .from('bank_transfers')
        .update({ 
          status: 'rejected',
          processed: true,
          processed_at: new Date().toISOString()
        })
        .eq('id', item.id);
      
      // 3. Create a notification for the user
      await supabase
        .from('notifications')
        .insert({
          user_id: item.user_id,
          title: "Dépôt rejeté",
          description: "Votre demande de dépôt n'a pas pu être validée. Veuillez contacter le support pour plus d'informations.",
          type: "deposit",
          category: "error"
        });
      
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
      
      console.log("Starting confirmReceipt for item:", item);
      
      // First, get the transfer amount
      const { data: transferData, error: fetchError } = await supabase
        .from('bank_transfers')
        .select('amount')
        .eq('id', item.id)
        .single();
        
      if (fetchError || !transferData) {
        console.error("Error fetching transfer amount:", fetchError);
        toast.error("Impossible de récupérer le montant du transfert");
        throw fetchError || new Error("Transfer not found");
      }
      
      console.log("Found transfer with amount:", transferData.amount);
      
      if (!transferData.amount || transferData.amount <= 0) {
        toast.error("Le transfert n'a pas de montant valide");
        return false;
      }
      
      // Use consistent server timestamp
      const serverTimestamp = new Date().toISOString();
      
      // Update bank transfer status to "received"
      // This will trigger the database trigger to update the wallet balance
      console.log("Updating bank transfer status to 'received'");
      const { error: transferError } = await supabase
        .from('bank_transfers')
        .update({ 
          status: 'received',
          receipt_confirmed: true,
          processed: true,
          processed_at: serverTimestamp
        })
        .eq('id', item.id);
        
      if (transferError) {
        console.error("Error updating bank transfer:", transferError);
        toast.error("Erreur lors de la mise à jour du transfert bancaire");
        throw transferError;
      }
      
      console.log("Successfully updated bank transfer status");
      
      // Force recalculate the user's wallet balance to ensure it's updated
      console.log(`Recalculating wallet balance for user ${item.user_id}`);
      const { error: rpcError } = await supabase.rpc('recalculate_wallet_balance', {
        user_uuid: item.user_id
      });
      
      if (rpcError) {
        console.error("Error recalculating balance:", rpcError);
        // Continue anyway since the trigger should have handled it
      } else {
        console.log(`Successfully recalculated balance for user ${item.user_id}`);
      }
      
      // Create notification for the user with the same timestamp
      await supabase
        .from('notifications')
        .insert({
          user_id: item.user_id,
          title: "Virement reçu",
          description: `Votre virement de ${transferData.amount}€ a été reçu et ajouté à votre portefeuille.`,
          type: "deposit",
          category: "success",
          metadata: {
            amount: transferData.amount,
            transaction_id: item.id,
            timestamp: serverTimestamp // Add timestamp to metadata
          },
          created_at: serverTimestamp // Explicitly set creation time
        });
      
      // Also update the related wallet transaction with the correct timestamp if it exists
      const { error: walletUpdateError } = await supabase
        .from('wallet_transactions')
        .update({ 
          created_at: serverTimestamp
        })
        .eq('id', item.id);

      if (walletUpdateError) {
        console.error("Error updating wallet transaction timestamp:", walletUpdateError);
        // Continue anyway as this is not critical
      }
      
      // Log admin action
      if (adminUser.id) {
        await logAdminAction(
          adminUser.id,
          'wallet_management',
          `Confirmation de réception de virement - Montant: ${transferData.amount}€`,
          item.user_id,
          undefined,
          transferData.amount
        );
      }
      
      toast.success("Réception de virement confirmée et solde mis à jour");
      return true;
    } catch (error) {
      console.error("Erreur lors de la confirmation de réception:", error);
      toast.error("Une erreur est survenue lors de la confirmation de réception");
      return false;
    }
  }
};
