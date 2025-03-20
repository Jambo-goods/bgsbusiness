
// Helper functions for user notifications

export async function sendUserNotification(supabase: any, userId: string, transfer: any) {
  try {
    if (!transfer) {
      console.log("No transfer details available for notification");
      return;
    }

    const amount = transfer.amount || 0;
    const reference = transfer.reference || '';
    
    console.log(`Sending virement notification to user ${userId} for amount ${amount}`);
    
    // Create notification for user dashboard
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: "Virement bancaire reçu",
        message: `Votre virement bancaire de ${amount}€${reference ? ` (réf: ${reference})` : ''} a été confirmé et ajouté à votre portefeuille.`,
        type: "deposit",
        seen: false,
        data: {
          category: "success",
          amount,
          reference,
          timestamp: new Date().toISOString()
        }
      });
    
    if (notificationError) {
      console.error("Error creating notification:", notificationError.message);
    } else {
      console.log("Successfully created notification for user");
    }
    
    // Create or update wallet transaction for transaction history
    const { data: existingTransaction, error: txCheckError } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('description', `Virement bancaire${reference ? ` (${reference})` : ''}`)
      .eq('type', 'deposit')
      .limit(1);
      
    if (txCheckError) {
      console.error("Error checking for existing transaction:", txCheckError.message);
    }
    
    if (existingTransaction && existingTransaction.length > 0) {
      // Update existing transaction
      const { error: txUpdateError } = await supabase
        .from('wallet_transactions')
        .update({
          amount: amount,
          receipt_confirmed: true,
          status: 'completed'
        })
        .eq('id', existingTransaction[0].id);
        
      if (txUpdateError) {
        console.error("Error updating wallet transaction:", txUpdateError.message);
      } else {
        console.log(`Updated existing wallet transaction with ID ${existingTransaction[0].id}`);
      }
    } else {
      // Create new transaction
      const { error: txInsertError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'deposit',
          description: `Virement bancaire${reference ? ` (${reference})` : ''}`,
          receipt_confirmed: true,
          status: 'completed'
        });
        
      if (txInsertError) {
        console.error("Error creating wallet transaction:", txInsertError.message);
      } else {
        console.log("Created new wallet transaction for deposit");
      }
    }
    
  } catch (error: any) {
    console.error("Error sending user notification:", error.message);
  }
}
