
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
    
    // Get current wallet balance
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error("Error fetching current wallet balance:", profileError.message);
    } else {
      console.log(`Current wallet balance: ${profileData?.wallet_balance || 0}`);
    }
    
    // Check if there's already a completed transaction for this user with this amount
    // This helps prevent double crediting
    const { data: existingCompletedTx, error: txCheckError } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('amount', amount)
      .eq('type', 'deposit')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (txCheckError) {
      console.error("Error checking for existing transactions:", txCheckError.message);
    } else if (existingCompletedTx && existingCompletedTx.length > 0) {
      // Only proceed if the transaction was created in the last 5 minutes
      // This prevents accidental double-crediting from retries
      const recentTxTime = new Date();
      recentTxTime.setMinutes(recentTxTime.getMinutes() - 5);
      
      const { data: recentTx } = await supabase
        .from('wallet_transactions')
        .select('created_at')
        .eq('id', existingCompletedTx[0].id)
        .single();
        
      if (recentTx && new Date(recentTx.created_at) > recentTxTime) {
        console.log("Wallet already credited in the last 5 minutes. Skipping to prevent double credit.");
        return;
      }
    }
    
    // Try to use RPC function first (most reliable method)
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
      console.log(`Updating balance directly: ${profileData.wallet_balance} + ${amount} = ${newBalance}`);
      
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
    
    // Also find and update any pending transaction for this deposit
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
          receipt_confirmed: true,
          updated_at: new Date().toISOString() // Add timestamp to force change detection
        })
        .eq('id', pendingTransaction[0].id);
      
      console.log(`Updated existing wallet transaction with ID ${pendingTransaction[0].id}`);
    } else {
      // If no pending transaction found, create a new one to ensure visibility in transaction history
      const { error: createTxError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'deposit',
          description: `Dépôt par virement bancaire`,
          status: 'completed',
          receipt_confirmed: true
        });
        
      if (createTxError) {
        console.error("Error creating new wallet transaction:", createTxError.message);
      } else {
        console.log("Created new wallet transaction to record deposit");
      }
    }
  } catch (error: any) {
    console.error("Error updating wallet balance:", error.message);
  }
}
