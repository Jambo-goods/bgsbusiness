
// Helper functions for wallet balance updates

export async function updateUserWalletBalance(supabase: any, userId: string, amount: number) {
  try {
    if (!userId || amount <= 0) {
      console.log(`Invalid parameters for wallet update: userId=${userId}, amount=${amount}`);
      return false;
    }
    
    console.log(`Updating wallet balance for user ${userId} by adding ${amount}`);
    
    // First check if there are any recent completed transactions with the same amount
    // to prevent duplicate crediting
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
    
    const { data: recentTransactions, error: txError } = await supabase
      .from('wallet_transactions')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('amount', amount)
      .eq('status', 'completed')
      .eq('type', 'deposit')
      .gte('created_at', fiveMinutesAgo.toISOString())
      .order('created_at', { ascending: false });
      
    if (txError) {
      console.error("Error checking for recent transactions:", txError.message);
    } else if (recentTransactions && recentTransactions.length > 0) {
      console.warn(`Found ${recentTransactions.length} recent completed transactions with same amount in the last 5 minutes`);
      console.warn("This might be a duplicate request - proceeding with caution");
      
      // If there are very recent transactions with the same amount, check the user's current balance
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();
        
      if (!profileError && profileData) {
        console.log(`Current wallet balance: ${profileData.wallet_balance}`);
        
        // Get all completed deposits in the last 10 minutes to check for possible duplicates
        const tenMinutesAgo = new Date();
        tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
        
        const { data: recentDeposits } = await supabase
          .from('wallet_transactions')
          .select('amount, created_at')
          .eq('user_id', userId)
          .eq('type', 'deposit')
          .eq('status', 'completed')
          .gte('created_at', tenMinutesAgo.toISOString())
          .order('created_at', { ascending: false });
          
        const totalRecentDeposits = recentDeposits?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
        
        if (totalRecentDeposits >= amount) {
          console.warn(`Recent deposits (${totalRecentDeposits}) already exceed or match this amount (${amount})`);
          console.warn("Skipping wallet update to prevent double crediting");
          return true; // Indicate success but we didn't actually update
        }
      }
    }
    
    // First try to use the RPC function for safer updates
    const { error: rpcError } = await supabase.rpc('increment_wallet_balance', {
      user_id: userId,
      increment_amount: amount
    });
    
    if (rpcError) {
      console.error("RPC update failed:", rpcError.message);
      
      // Fall back to direct update if RPC fails
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
        return false;
      }
      
      const currentBalance = profileData?.wallet_balance || 0;
      const newBalance = currentBalance + amount;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', userId);
        
      if (updateError) {
        console.error("Error updating wallet balance:", updateError.message);
        return false;
      }
    }
    
    console.log(`Successfully updated wallet balance for user ${userId} by adding ${amount}`);
    return true;
  } catch (error: any) {
    console.error("Error updating wallet balance:", error.message);
    return false;
  }
}
