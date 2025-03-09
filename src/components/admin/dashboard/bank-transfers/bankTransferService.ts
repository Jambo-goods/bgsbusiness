
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BankTransferItem } from "./types";
import { logAdminAction } from "@/services/adminAuthService";

export async function confirmDeposit(item: BankTransferItem, amount: number): Promise<boolean> {
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
    
    // 2. Increment the user's wallet balance
    await supabase.rpc('increment_wallet_balance', {
      user_id: item.user_id,
      increment_amount: amount
    });
    
    // 3. Create a notification for the user
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
    
    // 4. Log admin action
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
}

export async function rejectDeposit(item: BankTransferItem): Promise<boolean> {
  try {
    // Get current admin information
    const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
    
    // 1. Update the wallet transaction status to rejected
    await supabase
      .from('wallet_transactions')
      .update({ status: 'rejected' })
      .eq('id', item.id);
    
    // 2. Create a notification for the user
    await supabase
      .from('notifications')
      .insert({
        user_id: item.user_id,
        title: "Dépôt rejeté",
        description: "Votre demande de dépôt n'a pas pu être validée. Veuillez contacter le support pour plus d'informations.",
        type: "deposit",
        category: "error"
      });
    
    // 3. Log admin action
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
}
