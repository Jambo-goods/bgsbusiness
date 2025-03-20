
// Helper functions for wallet balance updates

export async function updateUserWalletBalance(supabase: any, userId: string, amount: number) {
  try {
    console.log(`Updating wallet balance for user ${userId} with amount ${amount}`);
    
    if (!userId) {
      console.error("No user ID provided for wallet update");
      return;
    }
    
    if (!amount || amount <= 0) {
      console.error(`Invalid amount for wallet update: ${amount}`);
      return;
    }
    
    // Direct increment has higher priority for immediate feedback
    const { error: incrementError } = await supabase.rpc('increment_wallet_balance', {
      user_id: userId,
      increment_amount: amount
    });
    
    if (incrementError) {
      console.error("Increment wallet balance failed:", incrementError.message);
      
      // Fallback to direct database update if RPC fails
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error("Error fetching user profile:", profileError.message);
        return;
      }
      
      const newBalance = (profileData.wallet_balance || 0) + amount;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', userId);
        
      if (updateError) {
        console.error("Direct wallet update failed:", updateError.message);
        return;
      }
      
      console.log(`Successfully updated wallet balance directly to ${newBalance}`);
    } else {
      console.log(`Successfully incremented wallet balance by ${amount}`);
    }
    
    // Also create or update a wallet transaction to ensure visibility in transaction history
    const { data: existingTransaction, error: txCheckError } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('amount', amount)
      .eq('type', 'deposit')
      .eq('description', 'Dépôt de fonds (virement bancaire)')
      .limit(1);
    
    if (txCheckError) {
      console.error("Error checking for existing transaction:", txCheckError.message);
    } else if (existingTransaction && existingTransaction.length > 0) {
      // Update existing transaction to completed status
      await supabase
        .from('wallet_transactions')
        .update({
          status: 'completed',
          receipt_confirmed: true
        })
        .eq('id', existingTransaction[0].id);
      
      console.log(`Updated existing wallet transaction with ID ${existingTransaction[0].id}`);
    } else {
      // Create a new transaction for this deposit
      const { data: newTx, error: txInsertError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'deposit',
          description: 'Dépôt de fonds (virement bancaire)',
          receipt_confirmed: true,
          status: 'completed'
        })
        .select();
      
      if (txInsertError) {
        console.error("Error creating wallet transaction:", txInsertError.message);
      } else {
        console.log(`Created new wallet transaction with ID ${newTx?.[0]?.id}`);
      }
    }
  } catch (error: any) {
    console.error("Error updating wallet balance:", error.message);
  }
}
