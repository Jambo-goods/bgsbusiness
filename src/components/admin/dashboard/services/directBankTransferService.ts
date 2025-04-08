
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
      console.log(`Mise à jour directe du virement ${transferId} avec statut ${newStatus}, creditWallet=${creditWallet}`);
      
      // Normalize status - if "reçu" is passed, convert to "completed"
      const normalizedStatus = newStatus === 'reçu' ? 'completed' : newStatus === 'received' ? 'completed' : newStatus;
      
      // Check if the transfer has already been processed to avoid double processing
      if (bankTransferData && bankTransferData.status === 'completed' && normalizedStatus === 'completed') {
        console.log("Ce virement a déjà été traité comme complété");
        return {
          success: true,
          message: "Ce virement a déjà été traité comme complété",
          data: bankTransferData
        };
      }
      
      // Vérifier s'il s'agit d'une transaction wallet
      const { data: walletTransaction } = await supabase
        .from('wallet_transactions')
        .select('id')
        .eq('id', transferId)
        .maybeSingle();
        
      if (walletTransaction) {
        // Pour les transactions wallet, 'rejected' doit être 'cancelled'
        const safeStatus = normalizedStatus === 'rejected' ? 'cancelled' : normalizedStatus;
        
        const { data: updatedWalletTransaction, error: updateError } = await supabase
          .from('wallet_transactions')
          .update({
            status: safeStatus,
            receipt_confirmed: safeStatus === 'completed'
          })
          .eq('id', transferId)
          .select()
          .single();
          
        if (updateError) {
          console.error("Erreur lors de la mise à jour de la transaction wallet:", updateError);
          return {
            success: false,
            message: `Erreur: ${updateError.message}`,
            error: updateError
          };
        }
        
        return {
          success: true,
          message: `Transaction mise à jour: ${safeStatus}`,
          data: updatedWalletTransaction
        };
      }
      
      // First update the bank_transfer record
      const { data: updatedBankTransfer, error: updateError } = await supabase
        .from('bank_transfers')
        .update({
          status: normalizedStatus,
          processed: normalizedStatus === 'completed' || normalizedStatus === 'rejected' || processedDate !== null,
          processed_at: processedDate || (normalizedStatus === 'completed' || normalizedStatus === 'rejected' ? new Date().toISOString() : null),
          notes: `Updated to ${normalizedStatus} via direct method`
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
      if ((normalizedStatus === 'completed' || normalizedStatus === 'received') && bankTransferData?.user_id && bankTransferData?.amount && creditWallet) {
        console.log(`Mise à jour du solde pour l'utilisateur: ${bankTransferData.user_id} avec montant: ${bankTransferData.amount}`);
        
        // First check for existing completed transactions for this transfer
        const { data: existingCompletedTx } = await supabase
          .from('wallet_transactions')
          .select('id')
          .eq('user_id', bankTransferData.user_id)
          .eq('amount', bankTransferData.amount)
          .eq('status', 'completed')
          .ilike('description', `%${bankTransferData.reference || ''}%`)
          .maybeSingle();
        
        if (existingCompletedTx) {
          console.log(`Une transaction complétée existe déjà: ${existingCompletedTx.id}, pas de mise à jour du solde`);
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
          
          // Update the user's wallet balance using the increment_wallet_balance function
          const { error: walletError } = await supabase.rpc('increment_wallet_balance', {
            user_id: bankTransferData.user_id,
            increment_amount: bankTransferData.amount
          });
          
          if (walletError) {
            console.error("Erreur lors de la mise à jour du solde via RPC:", walletError);
            
            // Get current profile data
            const { data: profileData } = await supabase
              .from('profiles')
              .select('wallet_balance')
              .eq('id', bankTransferData.user_id)
              .single();
              
            if (profileData) {
              // Calculate new balance and update directly
              const newBalance = (profileData.wallet_balance || 0) + bankTransferData.amount;
              console.log(`Mise à jour directe du solde: ${profileData.wallet_balance} + ${bankTransferData.amount} = ${newBalance}`);
              
              const { error: directUpdateError } = await supabase
                .from('profiles')
                .update({ wallet_balance: newBalance })
                .eq('id', bankTransferData.user_id);
                
              if (directUpdateError) {
                console.error("Erreur lors de la mise à jour directe:", directUpdateError);
              } else {
                console.log(`Solde mis à jour directement à ${newBalance}€`);
              }
            }
          } else {
            console.log(`Solde mis à jour avec succès via RPC: +${bankTransferData.amount}€`);
          }
          
          // Send notification about the completed transfer
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: bankTransferData.user_id,
              title: 'Virement bancaire reçu',
              message: `Votre virement bancaire de ${bankTransferData.amount}€ a été confirmé et ajouté à votre portefeuille.`,
              type: 'deposit',
              seen: false,
              data: {
                amount: bankTransferData.amount,
                category: 'success',
                reference: bankTransferData.reference,
                timestamp: new Date().toISOString()
              }
            });
          
          if (notificationError) {
            console.error("Erreur lors de la création de la notification:", notificationError);
          } else {
            console.log("Notification de dépôt créée avec succès");
          }
        }
      } else if (normalizedStatus === 'rejected' && bankTransferData?.user_id) {
        // Pour un virement rejeté, créer une transaction avec le statut 'cancelled'
        const { data: existingTx } = await supabase
          .from('wallet_transactions')
          .select('id, status')
          .eq('user_id', bankTransferData.user_id)
          .ilike('description', `%${bankTransferData.reference || ''}%`)
          .maybeSingle();
          
        if (existingTx && existingTx.status !== 'cancelled') {
          // Mettre à jour la transaction existante
          await supabase
            .from('wallet_transactions')
            .update({
              status: 'cancelled', // Utiliser 'cancelled' au lieu de 'rejected'
              receipt_confirmed: false
            })
            .eq('id', existingTx.id);
            
          console.log(`Transaction existante mise à jour comme annulée: ${existingTx.id}`);
        } else if (!existingTx) {
          // Créer une nouvelle transaction annulée
          const { error: txError } = await supabase
            .from('wallet_transactions')
            .insert({
              user_id: bankTransferData.user_id,
              amount: bankTransferData.amount,
              type: 'deposit',
              description: `Virement bancaire rejeté (${bankTransferData.reference})`,
              status: 'cancelled', // Utiliser 'cancelled' au lieu de 'rejected'
              receipt_confirmed: false
            });
            
          if (txError) {
            console.error("Erreur lors de la création de la transaction annulée:", txError);
          } else {
            console.log("Transaction annulée créée avec succès");
          }
        }
        
        // Envoyer une notification de rejet
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: bankTransferData.user_id,
            title: 'Virement bancaire rejeté',
            message: `Votre virement bancaire de ${bankTransferData.amount}€ a été rejeté. Veuillez contacter notre service client pour plus d'informations.`,
            type: 'alert',
            seen: false,
            data: {
              amount: bankTransferData.amount,
              category: 'error',
              reference: bankTransferData.reference,
              timestamp: new Date().toISOString()
            }
          });
        
        if (notificationError) {
          console.error("Erreur lors de la création de la notification de rejet:", notificationError);
        } else {
          console.log("Notification de rejet créée avec succès");
        }
      }
      
      return {
        success: true,
        message: `Virement mis à jour: ${normalizedStatus}`,
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
