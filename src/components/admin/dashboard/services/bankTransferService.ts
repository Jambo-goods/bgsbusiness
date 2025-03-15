
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
      
      console.log("Starting confirmReceipt for item:", item.id);
      
      // Update the wallet transaction with receipt confirmation
      await supabase
        .from('wallet_transactions')
        .update({ receipt_confirmed: true })
        .eq('id', item.id);
      
      // First, get the transfer amount
      const { data: transferData, error: fetchError } = await supabase
        .from('bank_transfers')
        .select('amount')
        .eq('id', item.id)
        .single();
        
      if (fetchError || !transferData) {
        console.error("Error fetching transfer amount:", fetchError);
        throw fetchError || new Error("Transfer not found");
      }
      
      console.log("Found transfer amount:", transferData.amount);
      
      // Update the bank_transfer status to indicate receipt confirmed
      const { error: updateError } = await supabase
        .from('bank_transfers')
        .update({ 
          status: 'received',  // Changed to 'received' to match your status value
          receipt_confirmed: true,
          confirmed_at: new Date().toISOString()
        })
        .eq('id', item.id);
        
      if (updateError) {
        console.error("Error updating bank transfer status:", updateError);
        throw updateError;
      }
      
      console.log("Bank transfer status updated to 'received'");
      
      // Increment the user's wallet balance with the transfer amount
      if (transferData.amount) {
        console.log("Incrementing wallet balance by:", transferData.amount);
        
        // Get current wallet balance for debugging
        const { data: profileData } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', item.user_id)
          .single();
          
        console.log("Current wallet balance before update:", profileData?.wallet_balance);
        
        // Update the profiles table directly with the new balance
        const newBalance = (profileData?.wallet_balance || 0) + transferData.amount;
        console.log("New balance will be:", newBalance);
        
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({
            wallet_balance: newBalance
          })
          .eq('id', item.user_id);
        
        if (balanceError) {
          console.error("Error updating wallet balance directly:", balanceError);
          
          // Fallback to RPC function if direct update fails
          const { error: rpcError } = await supabase.rpc('increment_wallet_balance', {
            user_id: item.user_id,
            increment_amount: transferData.amount
          });
          
          if (rpcError) {
            console.error("Error incrementing wallet balance:", rpcError);
            throw rpcError;
          }
        }
        
        // Verify the balance was updated
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', item.user_id)
          .single();
          
        console.log("Wallet balance after update:", updatedProfile?.wallet_balance);
        
        // Create a notification for the user
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
              transaction_id: item.id
            }
          });
          
        console.log("Notification created for user");
      }
      
      // Log admin action
      if (adminUser.id) {
        await logAdminAction(
          adminUser.id,
          'wallet_management',
          `Confirmation de réception de virement - Réf: ${item.description}`,
          item.user_id
        );
      }
      
      toast.success("Réception de virement confirmée");
      return true;
    } catch (error) {
      console.error("Erreur lors de la confirmation de réception:", error);
      toast.error("Une erreur est survenue lors de la confirmation de réception");
      return false;
    }
  }
};
