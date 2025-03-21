
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
    
    // First check if the wallet was already credited for this amount recently (last 5 minutes)
    // to avoid double crediting
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
    
    const { data: recentTransactions, error: txError } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('amount', amount)
      .eq('type', 'deposit')
      .eq('status', 'completed')
      .gte('created_at', fiveMinutesAgo.toISOString())
      .limit(1);
      
    if (!txError && recentTransactions && recentTransactions.length > 0) {
      console.log(`Found recent completed transaction with same amount. Potential duplicate, skipping wallet update.`);
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
    
    // Also find and update any pending transaction for this deposit to ensure visibility in transaction history
    // but don't create a new one to avoid duplicates
    const { data: pendingTransaction, error: pendingTxError } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('amount', amount)
      .eq('type', 'deposit')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (pendingTxError) {
      console.error("Error checking for pending transaction:", pendingTxError.message);
    } else if (pendingTransaction && pendingTransaction.length > 0) {
      // Update existing transaction to completed status
      await supabase
        .from('wallet_transactions')
        .update({
          status: 'completed',
          receipt_confirmed: true
        })
        .eq('id', pendingTransaction[0].id);
      
      console.log(`Updated existing wallet transaction with ID ${pendingTransaction[0].id}`);
    }
  } catch (error: any) {
    console.error("Error updating wallet balance:", error.message);
  }
}
