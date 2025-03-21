
import { supabase } from "@/integrations/supabase/client";

export const directBankTransferService = {
  async updateBankTransferDirectly(
    transferId: string, 
    newStatus: string, 
    processedDate: string | null = null,
    bankTransferData: any = null,
    creditWallet: boolean = true // Keep parameter with default value
  ) {
    try {
      console.log(`Mise à jour directe du virement ${transferId} avec statut ${newStatus}`);
      
      // Check if the transfer has already been processed to avoid double processing
      if (bankTransferData && bankTransferData.status === 'completed' && newStatus === 'completed') {
        console.log("Ce virement a déjà été traité comme complété");
        return {
          success: true,
          message: "Ce virement a déjà été traité comme complété",
          data: bankTransferData
        };
      }
      
      // First update the bank_transfer record
      const { data: updatedBankTransfer, error: updateError } = await supabase
        .from('bank_transfers')
        .update({
          status: newStatus,
          processed: newStatus === 'completed' || newStatus === 'received' || processedDate !== null,
          processed_at: processedDate || (newStatus === 'completed' || newStatus === 'received' ? new Date().toISOString() : null),
          notes: `Updated to ${newStatus} via direct method`
        })
        .eq('id', transferId)
        .select()
        .single();
      
      if (updateError) {
        console.error("Erreur lors de la mise à jour du virement:", updateError);
        return {
          success: false,
          message: `Erreur: ${updateError.message}`,
          error: updateError
        };
      }
      
      // If changing status to 'completed' or 'received', update the user's wallet balance
      if ((newStatus === 'completed' || newStatus === 'received') && bankTransferData?.user_id && bankTransferData?.amount && creditWallet) {
        console.log(`Mise à jour du solde pour l'utilisateur: ${bankTransferData.user_id}`);
        
        // First check for existing completed transactions for this transfer
        const { data: existingTx } = await supabase
          .from('wallet_transactions')
          .select('id')
          .eq('user_id', bankTransferData.user_id)
          .eq('amount', bankTransferData.amount)
          .eq('status', 'completed')
          .ilike('description', `%${bankTransferData.reference || ''}%`)
          .maybeSingle();
        
        if (existingTx) {
          console.log(`Une transaction complétée existe déjà: ${existingTx.id}`);
        } else {
          // Find any pending transaction first
          const { data: pendingTx } = await supabase
            .from('wallet_transactions')
            .select('id')
            .eq('user_id', bankTransferData.user_id)
            .eq('amount', bankTransferData.amount)
            .eq('status', 'pending')
            .ilike('description', `%${bankTransferData.reference || ''}%`)
            .maybeSingle();
          
          if (pendingTx) {
            // Update existing pending transaction
            await supabase
              .from('wallet_transactions')
              .update({
                status: 'completed',
                receipt_confirmed: true
              })
              .eq('id', pendingTx.id);
            
            console.log(`Mise à jour de la transaction en attente: ${pendingTx.id}`);
          } else {
            // Create a new transaction
            const { error: txError } = await supabase
              .from('wallet_transactions')
              .insert({
                user_id: bankTransferData.user_id,
                amount: bankTransferData.amount,
                type: 'deposit',
                description: `Virement bancaire (${bankTransferData.reference})`,
                status: 'completed',
                receipt_confirmed: true
              });
            
            if (txError) {
              console.error("Erreur lors de la création de la transaction:", txError);
            } else {
              console.log("Transaction créée avec succès");
            }
          }
          
          // Update the user's wallet balance
          const { error: walletError } = await supabase.rpc('increment_wallet_balance', {
            user_id: bankTransferData.user_id,
            increment_amount: bankTransferData.amount
          });
          
          if (walletError) {
            console.error("Erreur lors de la mise à jour du solde:", walletError);
          } else {
            console.log(`Solde mis à jour avec succès: +${bankTransferData.amount}`);
          }
        }
      }
      
      return {
        success: true,
        message: `Virement mis à jour: ${newStatus}`,
        data: updatedBankTransfer
      };
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour directe:", error);
      return {
        success: false,
        message: `Erreur système: ${error.message || 'Erreur inconnue'}`,
        error: error
      };
    }
  }
};
