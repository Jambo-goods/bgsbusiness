
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
  }
};
