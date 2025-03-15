
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
      
      // 1. Update the wallet transaction status to completed and set the amount
      await supabase
        .from('wallet_transactions')
        .update({ 
          status: 'completed',
          amount: amount
        })
        .eq('id', item.id);
      
      // 2. Update bank_transfer status to "reçu" (received)
      await supabase
        .from('bank_transfers')
        .update({ 
          status: 'reçu',
          processed: true,
          processed_at: new Date().toISOString(),
          amount: amount
        })
        .eq('id', item.id);
      
      // 3. Increment the user's wallet balance
      await supabase.rpc('increment_wallet_balance', {
        user_id: item.user_id,
        increment_amount: amount
      });
      
      // 4. Create a notification for the user
      await supabase
        .from('notifications')
        .insert({
          user_id: item.user_id,
          title: "Dépôt confirmé",
          description: `Votre dépôt de ${amount}€ a été validé et ajouté à votre portefeuille.`,
          type: "deposit",
          category: "success",
          metadata: {
            amount,
            transaction_id: item.id
          }
        });
      
      // 5. Log admin action
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
      
      // Use a transaction to ensure all updates are consistent
      const transaction = async () => {
        // 1. Update the wallet_transactions table
        const { error: txError } = await supabase
          .from('wallet_transactions')
          .update({ 
            receipt_confirmed: true,
            status: 'completed',
            amount: transferData.amount
          })
          .eq('id', item.id);
          
        if (txError) {
          console.error("Error updating wallet transaction:", txError);
          throw txError;
        }
        
        // 2. Update the bank_transfers table
        const { error: transferError } = await supabase
          .from('bank_transfers')
          .update({ 
            status: 'received',  // Using 'received' consistently
            receipt_confirmed: true,
            confirmed_at: new Date().toISOString()
          })
          .eq('id', item.id);
          
        if (transferError) {
          console.error("Error updating bank transfer:", transferError);
          throw transferError;
        }
        
        // 3. Get the current wallet balance
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', item.user_id)
          .single();
          
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          throw profileError;
        }
        
        const currentBalance = profileData?.wallet_balance || 0;
        console.log("Current wallet balance:", currentBalance);
        
        const newBalance = currentBalance + transferData.amount;
        console.log("New balance will be:", newBalance);
        
        // 4. Update the profiles table with the new balance
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            wallet_balance: newBalance
          })
          .eq('id', item.user_id);
        
        if (updateError) {
          console.error("Error updating wallet balance:", updateError);
          throw updateError;
        }
        
        // 5. Create a notification
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: item.user_id,
            title: "Virement reçu",
            description: `Votre virement de ${transferData.amount}€ a été reçu et ajouté à votre portefeuille.`,
            type: "deposit",
            category: "success",
            metadata: {
              amount: transferData.amount,
              transaction_id: item.id
            }
          });
          
        if (notifError) {
          console.error("Error creating notification:", notifError);
          // Don't throw here - notification is not critical
        }
      };
      
      // Execute all operations
      await transaction();
      
      // Verify the balance was updated
      const { data: verifyProfile } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', item.user_id)
        .single();
        
      console.log("Verified wallet balance after update:", verifyProfile?.wallet_balance);
      
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
