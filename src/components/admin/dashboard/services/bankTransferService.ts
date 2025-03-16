
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BankTransferItem } from "../types/bankTransfer";
import { logAdminAction } from "@/services/adminAuthService";

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
      
      // Send a notification to the user about the deposit confirmation
      try {
        // Get user information
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', item.user_id)
          .single();
        
        if (userError) {
          console.error("Error fetching user data:", userError);
        } else {
          // Send email notification
          const userName = `${userData.first_name} ${userData.last_name}`;
          
          await supabase.functions.invoke('send-user-notification', {
            body: {
              userEmail: userData.email,
              userName,
              subject: "Dépôt confirmé",
              eventType: "deposit",
              data: {
                amount: amount,
                status: "completed"
              }
            }
          });
          
          console.log(`Notification sent to user ${item.user_id} about deposit confirmation`);
        }
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
        // Continue even if notification fails
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
