
// Helper functions for sending notifications to users

export async function sendUserNotification(supabase: any, userId: string, transferData: any) {
  try {
    if (!userId) {
      console.error("No user ID provided for notification");
      return;
    }
    
    console.log(`Sending notification to user ${userId} for transfer`);
    
    // Simple notification about deposit being received
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'wallet_deposit',
        title: 'Dépôt reçu',
        message: `Votre dépôt de ${transferData.amount || 0}€ a été confirmé.`,
        data: {
          amount: transferData.amount || 0,
          reference: transferData.reference || 'Virement bancaire',
          category: 'success',
          timestamp: new Date().toISOString()
        },
        seen: false
      });
      
    console.log("Notification sent successfully");
    
    // Make sure the wallet balance is updated
    try {
      console.log(`Ensuring wallet balance is updated for user ${userId} with amount ${transferData.amount}`);
      
      // First try to use the RPC function for reliable wallet balance update
      const { error: rpcError } = await supabase.rpc('increment_wallet_balance', {
        user_id: userId,
        increment_amount: transferData.amount || 0
      });
      
      if (rpcError) {
        console.error("Failed to update wallet via RPC:", rpcError.message);
        
        // Fallback to direct update if RPC fails
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', userId)
          .single();
          
        if (profileError) {
          console.error("Failed to get profile data:", profileError.message);
        } else {
          const newBalance = (profileData.wallet_balance || 0) + (transferData.amount || 0);
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ wallet_balance: newBalance })
            .eq('id', userId);
            
          if (updateError) {
            console.error("Failed to update wallet balance directly:", updateError.message);
          } else {
            console.log(`Wallet balance updated to ${newBalance}`);
          }
        }
      } else {
        console.log(`Wallet balance updated via RPC by adding ${transferData.amount || 0}`);
      }
      
      // Also ensure there's a completed wallet transaction
      const { data: existingTransaction } = await supabase
        .from('wallet_transactions')
        .select('id, status')
        .eq('user_id', userId)
        .eq('amount', transferData.amount || 0)
        .ilike('description', `%${transferData.reference || ''}%`)
        .maybeSingle();
        
      if (existingTransaction) {
        if (existingTransaction.status !== 'completed') {
          // Update status to completed if it exists but isn't completed
          await supabase
            .from('wallet_transactions')
            .update({ status: 'completed', receipt_confirmed: true })
            .eq('id', existingTransaction.id);
            
          console.log(`Updated existing transaction ${existingTransaction.id} to completed`);
        } else {
          console.log(`Transaction already exists and is completed`);
        }
      } else {
        // Create a new completed transaction
        const { error: txError } = await supabase
          .from('wallet_transactions')
          .insert({
            user_id: userId,
            amount: transferData.amount || 0,
            type: 'deposit',
            description: `Virement bancaire (${transferData.reference || ''})`,
            status: 'completed',
            receipt_confirmed: true
          });
          
        if (txError) {
          console.error("Failed to create wallet transaction:", txError.message);
        } else {
          console.log("Created new completed wallet transaction");
        }
      }
    } catch (walletError: any) {
      console.error("Error updating wallet:", walletError.message);
    }
  } catch (error: any) {
    console.error("Error sending notification:", error.message);
  }
}
