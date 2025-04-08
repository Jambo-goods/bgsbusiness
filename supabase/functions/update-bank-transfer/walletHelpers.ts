
// Helper function to update user wallet balance

export async function updateUserWalletBalance(supabase: any, userId: string, amount: number) {
  try {
    if (!userId || !amount) {
      console.log("Missing required parameters for wallet update");
      return;
    }
    
    // First check if the user exists
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error("Error getting user profile:", userError.message);
      return;
    }
    
    let currentBalance = userProfile?.wallet_balance || 0;
    console.log(`Current wallet balance: ${currentBalance}`);
    
    // Use RPC function to update balance (most reliable method)
    const { error: rpcError } = await supabase.rpc('increment_wallet_balance', {
      user_id: userId,
      increment_amount: amount
    });
    
    if (rpcError) {
      console.error("Error updating balance via RPC:", rpcError.message);
      
      // Fallback to direct update if RPC fails
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: currentBalance + amount })
        .eq('id', userId);
        
      if (updateError) {
        console.error("Direct balance update failed:", updateError.message);
        return;
      }
    }
    
    console.log(`Successfully incremented wallet balance by ${amount}`);
    
    // Create a new transaction to record deposit
    const { error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        type: 'deposit',
        description: 'Virement bancaire traité',
        status: 'completed', // Always use a valid status
        receipt_confirmed: true
      });
      
    if (txError) {
      console.error("Error creating transaction record:", txError.message);
    } else {
      console.log("Created new wallet transaction to record deposit");
    }
    
  } catch (error: any) {
    console.error("Error updating wallet balance:", error.message);
  }
}
