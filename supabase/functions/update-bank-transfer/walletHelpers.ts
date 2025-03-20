
// Helper functions for wallet balance updates

export async function updateUserWalletBalance(supabase: any, userId: string, transferId: string | number, amount?: number) {
  try {
    console.log(`Updating wallet balance for user ${userId}`);
    
    let transferAmount = amount;
    
    // If amount not provided directly, try to get it from the transfer
    if (transferAmount === undefined && typeof transferId === 'string') {
      // Get the transfer to check the amount
      const { data: transfer, error: transferError } = await supabase
        .from('bank_transfers')
        .select('amount')
        .eq('id', transferId)
        .maybeSingle();
      
      if (transferError) {
        console.error("Error fetching transfer:", transferError.message);
      } else {
        transferAmount = transfer?.amount;
      }
    }
    
    // If we have a valid amount, directly increment the wallet balance first
    if (transferAmount !== undefined && transferAmount > 0) {
      // Direct increment has higher priority for immediate feedback
      const { error: incrementError } = await supabase.rpc('increment_wallet_balance', {
        user_id: userId,
        increment_amount: transferAmount
      });
      
      if (incrementError) {
        console.error("Increment wallet balance failed:", incrementError.message);
      } else {
        console.log(`Successfully incremented wallet balance by ${transferAmount}`);
        
        // Also create or update a wallet transaction to ensure visibility in transaction history
        const { data: existingTransaction } = await supabase
          .from('wallet_transactions')
          .select('id')
          .eq('user_id', userId)
          .eq('amount', transferAmount)
          .eq('type', 'deposit')
          .limit(1);
          
        if (existingTransaction && existingTransaction.length > 0) {
          // Update existing transaction to completed status
          await supabase
            .from('wallet_transactions')
            .update({
              status: 'completed',
              receipt_confirmed: true
            })
            .eq('id', existingTransaction[0].id);
        } else {
          // Create a new transaction for this deposit
          await supabase
            .from('wallet_transactions')
            .insert({
              user_id: userId,
              amount: transferAmount,
              type: 'deposit',
              description: 'Dépôt de fonds (virement bancaire)',
              receipt_confirmed: true,
              status: 'completed'
            });
        }
        
        return; // Exit early as we've already updated the balance
      }
    }
    
    // Fallback to recalculation function if direct increment didn't work
    const { error: recalcError } = await supabase.rpc('recalculate_wallet_balance', {
      user_uuid: userId
    });
    
    if (recalcError) {
      console.error("Recalculate wallet balance failed:", recalcError.message);
    } else {
      console.log("Successfully recalculated wallet balance");
    }
  } catch (error: any) {
    console.error("Error updating wallet balance:", error.message);
  }
}
